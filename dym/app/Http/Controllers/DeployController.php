<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Process\ProcessResult;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Process;

class DeployController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        if (! $this->authorized($request)) {
            return $this->unauthorized();
        }

        [$output, $errors] = $this->runPostDeployCommands();

        return $errors === []
            ? response()->json(['deployed' => true, 'output' => $output])
            : response()->json(['deployed' => false, 'output' => $output, 'errors' => $errors], 500);
    }

    public function gitMirror(Request $request): JsonResponse
    {
        if (! $this->authorized($request)) {
            return $this->unauthorized();
        }

        $fetch = Process::path(base_path())->timeout(180)->run(['git', 'fetch', '--all']);

        if ($fetch->failed()) {
            return response()->json([
                'deployed' => false,
                'errors' => ['git_fetch' => $this->processOutput($fetch)],
            ], 500);
        }

        $reset = Process::path(base_path())->timeout(60)->run(['git', 'reset', '--hard', 'origin/deploy']);

        if ($reset->failed()) {
            return response()->json([
                'deployed' => false,
                'git_output' => $this->processOutput($reset),
                'errors' => ['git_reset' => 'Impossible d’aligner les fichiers suivis sur origin/deploy.'],
            ], 500);
        }

        [$output, $errors] = $this->runPostDeployCommands();
        $output['git'] = $this->processOutput($reset);

        return $errors === []
            ? response()->json(['deployed' => true, 'output' => $output])
            : response()->json(['deployed' => false, 'output' => $output, 'errors' => $errors], 500);
    }

    public function probe(Request $request): JsonResponse
    {
        if (! $this->authorized($request, allowQueryToken: true)) {
            return $this->unauthorized();
        }

        $disabled = array_filter(array_map('trim', explode(',', (string) ini_get('disable_functions'))));
        $canRun = static fn (string $function): bool => function_exists($function) && ! in_array($function, $disabled, true);
        $git = null;

        if ($canRun('proc_open')) {
            $result = Process::path(base_path())->timeout(10)->run(['git', '--version']);
            $git = $result->successful() ? trim($result->output()) : null;
        }

        return response()->json([
            'php_version' => PHP_VERSION,
            'base_path' => base_path(),
            'exec_channel' => [
                'proc_open' => $canRun('proc_open'),
                'shell_exec' => $canRun('shell_exec'),
                'disable_functions' => array_values($disabled),
            ],
            'git' => [
                'binary' => $git,
                'repository_root' => $this->gitRoot(),
                'repo_present' => $this->gitRoot() !== null,
            ],
            'option1_git_reset_possible' => $canRun('proc_open') && $git !== null && $this->gitRoot() !== null,
        ]);
    }

    private function runPostDeployCommands(): array
    {
        $output = [];
        $errors = [];

        foreach ([
            'migrate' => ['migrate', ['--force' => true]],
            'storage:link' => ['storage:link', ['--force' => true]],
            'optimize:clear' => ['optimize:clear', []],
        ] as $key => [$command, $arguments]) {
            try {
                $exitCode = Artisan::call($command, $arguments);
                $output[$key] = trim(Artisan::output());

                if ($exitCode !== 0) {
                    $errors[$key] = "Exit code {$exitCode}: {$output[$key]}";
                }
            } catch (\Throwable $exception) {
                $errors[$key] = $exception->getMessage();
            }
        }

        try {
            Artisan::call('queue:restart');
            $output['queue:restart'] = trim(Artisan::output());
        } catch (\Throwable) {
            $output['queue:restart'] = 'skipped';
        }

        return [$output, $errors];
    }

    private function authorized(Request $request, bool $allowQueryToken = false): bool
    {
        $expected = (string) config('app.deploy_token', '');
        $provided = $request->header('X-Deploy-Token', '');

        if ($allowQueryToken && $provided === '') {
            $provided = (string) $request->query('token', '');
        }

        return $expected !== '' && hash_equals($expected, (string) $provided);
    }

    private function unauthorized(): JsonResponse
    {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    private function processOutput(ProcessResult $result): string
    {
        return trim($result->output().$result->errorOutput());
    }

    private function gitRoot(): ?string
    {
        if (! function_exists('proc_open')) {
            return null;
        }

        $result = Process::path(base_path())->timeout(10)->run(['git', 'rev-parse', '--show-toplevel']);

        return $result->successful() ? trim($result->output()) : null;
    }
}
