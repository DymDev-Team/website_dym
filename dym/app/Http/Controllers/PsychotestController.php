<?php

namespace App\Http\Controllers;

use App\Models\Psychotest;
use App\Recruitment\CandidateMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Page where the candidate takes the test, reached by the personal link.
 * One question at a time, timed by the server; the candidate never sees
 * the right answers nor the score, and the test only goes on on the device
 * where it started.
 */
class PsychotestController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        $test = $this->find($token);
        $test->catchUp();
        $status = $test->status();

        if ($status === 'started' && ! $test->isDevice($this->secret($request, $test))) {
            $status = 'other_device';
        }

        $started = $status === 'started';

        return Inertia::render('test-psychotechnique', [
            'token' => $token,
            'status' => $status,
            'greeting' => CandidateMail::fill('{nom}', $test->application->candidate->name, null),
            'offer' => $test->application->jobOffer?->title,
            'count' => count($test->questions),
            'question_seconds' => $test->question_seconds,
            'expires_at' => $test->expires_at,
            'exits' => $test->exits,
            'index' => $test->current_question,
            'question' => $started ? $test->currentQuestion() : null,
            'seconds_left' => $started ? $test->secondsLeft() : $test->question_seconds,
        ]);
    }

    /**
     * Start the clock and bind the test to this device.
     */
    public function start(string $token): RedirectResponse
    {
        $test = $this->find($token);

        if ($test->status() !== 'sent') {
            return back();
        }

        return back()->withCookie(cookie(self::cookieName($test), $test->start(), 60 * 24 * 60));
    }

    /**
     * Answer of the question on screen, or none when its time ran out.
     */
    public function answer(Request $request, string $token): RedirectResponse
    {
        $test = $this->find($token);
        $valid = $request->validate([
            'question_id' => ['required', 'string', 'max:20'],
            'option' => ['nullable', 'integer', 'between:0,3'],
        ]);

        if ($test->isDevice($this->secret($request, $test))) {
            $test->answer($valid['question_id'], isset($valid['option']) ? (int) $valid['option'] : null);
        }

        return back();
    }

    /**
     * The page noticed the candidate left it for a few seconds.
     */
    public function leave(Request $request, string $token): RedirectResponse
    {
        $test = $this->find($token);
        $seconds = (int) $request->validate(['seconds' => ['required', 'integer', 'min:0', 'max:86400']])['seconds'];

        if ($test->isDevice($this->secret($request, $test))) {
            $test->leave($seconds);
        }

        return back();
    }

    private function find(string $token): Psychotest
    {
        return Psychotest::query()
            ->where('token', $token)
            ->whereNotNull('sent_at')
            ->with(['application.candidate', 'application.jobOffer'])
            ->firstOrFail();
    }

    private function secret(Request $request, Psychotest $test): ?string
    {
        $value = $request->cookie(self::cookieName($test));

        return is_string($value) ? $value : null;
    }

    /**
     * @return non-empty-string
     */
    private static function cookieName(Psychotest $test): string
    {
        return 'psychotest_'.$test->id;
    }
}
