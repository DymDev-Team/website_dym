<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $this->ensureOrigin();

        // Seule la branche construite par le CI est utile : pas de « fetch --all ».
        $fetch = Process::path(base_path())->timeout(180)->run(['git', 'fetch', '--prune', 'origin', 'deploy']);

        if ($fetch->failed()) {
            return response()->json([
                'deployed' => false,
                'errors' => ['git_fetch' => $this->processOutput($fetch)],
            ], 500);
        }

        $reset = Process::path(base_path())->timeout(60)->run(['git', 'reset', '--hard', 'FETCH_HEAD']);

        if ($reset->failed()) {
            return response()->json([
                'deployed' => false,
                'git_output' => $this->processOutput($reset),
                'errors' => ['git_reset' => 'Impossible d’aligner les fichiers suivis sur origin/deploy.'],
            ], 500);
        }

        [$output, $errors] = $this->runPostDeployCommands();
        $output['git'] = $this->processOutput($reset);
        $output['git_remote'] = trim(Process::path(base_path())->run(['git', 'remote', 'get-url', 'origin'])->output());

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

    /**
     * Le dossier LWS hébergeait auparavant un autre dépôt : on rebranche son
     * remote sur celui du site et on retire les en-têtes d'authentification de
     * l'ancien dépôt (le dépôt du site est public).
     */
    private function ensureOrigin(): void
    {
        $repository = (string) config('app.deploy_repository');
        $current = trim(Process::path(base_path())->run(['git', 'remote', 'get-url', 'origin'])->output());

        if ($repository === '' || $current === $repository) {
            return;
        }

        Process::path(base_path())->run(['git', 'config', '--unset-all', 'http.extraheader']);
        Process::path(base_path())->run(['git', 'config', '--remove-section', 'http.https://github.com/']);
        Process::path(base_path())->run(
            $current === '' ? ['git', 'remote', 'add', 'origin', $repository] : ['git', 'remote', 'set-url', 'origin', $repository],
        );
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
