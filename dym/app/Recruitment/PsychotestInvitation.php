<?php

namespace App\Recruitment;

use App\Models\Psychotest;
use App\Models\RecruitmentSetting;
use Illuminate\Support\Carbon;

/**
 * Message inviting a candidate to take the test, sent by WhatsApp from the
 * team's phone or by e-mail.
 */
final class PsychotestInvitation
{
    public const SUBJECT = 'Votre test psychotechnique – DYM Manufacture';

    private const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    public static function text(Psychotest $test): string
    {
        $application = $test->application;
        $expires = $test->expires_at ?? Carbon::now()->addDays(RecruitmentSetting::values()['psychotest_validity_days']);
        $date = $expires->day.' '.self::MONTHS[$expires->month - 1].' '.$expires->year;
        $count = count($test->questions);

        return CandidateMail::fill(<<<TEXT
            Bonjour {nom},

            Merci pour votre candidature chez DYM Manufacture.
            Poste : {poste}

            Nous vous invitons à passer un test psychotechnique en ligne : {$count} questions, {$test->duration_minutes} minutes, une seule tentative. Prévoyez un moment au calme avant de commencer.

            {$test->url()}

            Ce lien est personnel et valable jusqu’au {$date}.

            Cordialement,
            L’équipe DYM Manufacture
            TEXT, $application->candidate->name, $application->jobOffer?->title);
    }

    /**
     * WhatsApp link opening a chat with the candidate, message written, or
     * null when the phone number cannot be dialled internationally.
     */
    public static function whatsappUrl(Psychotest $test): ?string
    {
        $number = self::internationalNumber($test->application->candidate->phone);

        return $number === null ? null : 'https://wa.me/'.$number.'?text='.rawurlencode(self::text($test));
    }

    /**
     * Digits with the country code, as wa.me expects them. A ten-digit
     * number starting with 0 is an Ivorian one.
     */
    public static function internationalNumber(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone) ?? '';

        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '0')) {
            $digits = '225'.$digits;
        }

        return strlen($digits) >= 11 && strlen($digits) <= 15 ? $digits : null;
    }
}
