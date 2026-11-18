<?php

use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;

beforeEach(function () {
    config(['app.deploy_token' => 'secret-token']);
});

test('the webhooks refuse a missing or wrong token', function (string $uri) {
    $this->postJson($uri)->assertForbidden();
    $this->postJson($uri, [], ['X-Deploy-Token' => 'wrong'])->assertForbidden();
})->with(['/api/deploy', '/api/deploy/git', '/api/deploy/mail']);

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

test('the mail check reports the mailer in use and sends to the Resend test address', function () {
    Http::fake(['api.resend.com' => Http::response('', 200)]);
    config(['services.resend.key' => 're_secret123456']);

    $this->postJson('/api/deploy/mail', [], ['X-Deploy-Token' => 'secret-token'])
        ->assertOk()
        ->assertExactJson([
            'mailer' => 'array',
            'from' => config('mail.from.address'),
            'resend_key' => 're_sec…',
            'resend_library' => true,
            'resend_api' => 200,
            'send' => 'ok',
        ]);

    $messages = app('mailer')->getSymfonyTransport()->messages();
    expect($messages)->toHaveCount(1)
        ->and($messages[0]->getEnvelope()->getRecipients()[0]->getAddress())->toBe('delivered@resend.dev');
});

test('the mail check returns the sending error', function () {
    Http::fake(['api.resend.com' => Http::response('', 200)]);
    config([
        'mail.default' => 'smtp',
        'mail.mailers.smtp.host' => '127.0.0.1',
        'mail.mailers.smtp.port' => 1,
        'mail.mailers.smtp.timeout' => 2,
    ]);

    $this->postJson('/api/deploy/mail', [], ['X-Deploy-Token' => 'secret-token'])
        ->assertOk()
        ->assertJsonPath('mailer', 'smtp')
        ->assertJson(fn ($json) => $json->where('send', fn (string $send) => str_starts_with($send, 'Symfony\Component\Mailer\Exception\TransportException'))->etc());
});
