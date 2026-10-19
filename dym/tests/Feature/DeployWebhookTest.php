<?php

use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;

beforeEach(function () {
    config(['app.deploy_token' => 'secret-token']);
});

test('the webhooks refuse a missing or wrong token', function (string $uri) {
    $this->postJson($uri)->assertForbidden();
    $this->postJson($uri, [], ['X-Deploy-Token' => 'wrong'])->assertForbidden();
})->with(['/api/deploy', '/api/deploy/git']);

test('the webhooks are disabled when no token is configured', function () {
    config(['app.deploy_token' => '']);

    $this->postJson('/api/deploy', [], ['X-Deploy-Token' => ''])->assertForbidden();
});

test('the git mirror rebinds origin to the site repository then resets to the deploy branch', function () {
    Process::fake(fn (PendingProcess $process) => $process->command === ['git', 'remote', 'get-url', 'origin']
        ? Process::result('https://github.com/DymDev-Team/dym-website.git')
        : Process::result());

    $this->postJson('/api/deploy/git', [], ['X-Deploy-Token' => 'secret-token'])
        ->assertOk()
        ->assertJsonPath('deployed', true);

    Process::assertRan(fn (PendingProcess $process) => $process->command === ['git', 'remote', 'set-url', 'origin', 'https://github.com/DymDev-Team/website_dym.git']);
    Process::assertRan(fn (PendingProcess $process) => $process->command === ['git', 'fetch', '--prune', 'origin', 'deploy']);
    Process::assertRan(fn (PendingProcess $process) => $process->command === ['git', 'reset', '--hard', 'FETCH_HEAD']);
});

test('the git mirror stops when the fetch fails', function () {
    Process::fake(fn (PendingProcess $process) => $process->command[1] === 'fetch'
        ? Process::result(errorOutput: 'could not resolve host', exitCode: 128)
        : Process::result('https://github.com/DymDev-Team/website_dym.git'));

    $this->postJson('/api/deploy/git', [], ['X-Deploy-Token' => 'secret-token'])
        ->assertServerError()
        ->assertJsonPath('errors.git_fetch', 'could not resolve host');

    Process::assertDidntRun(fn (PendingProcess $process) => ($process->command[1] ?? null) === 'reset');
});
