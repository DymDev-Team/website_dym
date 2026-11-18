<?php

namespace App\Recruitment;

use App\Models\RecruitmentSetting;
use App\Models\Setting;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Str;

/**
 * Wording and layout shared by every e-mail sent to candidates: the
 * acknowledgment and the messages of the pipeline.
 */
final class CandidateMail
{
    /**
     * Fill {nom} and {poste} in a subject or a text.
     */
    public static function fill(string $text, ?string $candidateName, ?string $offerTitle): string
    {
        return strtr($text, [
            '{nom}' => self::safeName((string) $candidateName),
            '{poste}' => $offerTitle ?? 'Candidature spontanée',
        ]);
    }

    /**
     * E-mail ready to send, replies going to a mailbox read by DYM.
     */
    public static function message(string $subject, string $body): MailMessage
    {
        $replyTo = RecruitmentSetting::values()['acknowledgment_reply_to'] ?: Setting::values()['email'];

        return (new MailMessage)
            ->subject($subject)
            ->when($replyTo, fn (MailMessage $mail, string $address) => $mail->replyTo($address))
            ->markdown('mail.candidate', ['paragraphs' => self::paragraphs($body)]);
    }

    /**
     * Paragraphs separated by a blank line; a single line break is kept as a
     * Markdown hard break.
     *
     * @return list<string>
     */
    public static function paragraphs(string $text): array
    {
        $blocks = preg_split('/\n\s*\n/', str_replace(["\r\n", "\r"], "\n", trim($text))) ?: [];

        return array_values(array_filter(array_map(
            fn (string $block) => implode("  \n", array_map('trim', explode("\n", trim($block)))),
            $blocks,
        ), 'filled'));
    }

    /**
     * The name comes from a public form or a CV: only letters, spaces,
     * hyphens and apostrophes are kept, so that no link or formatting can be
     * slipped into an e-mail sent in DYM's name.
     */
    private static function safeName(string $name): string
    {
        $name = preg_replace('/[^\pL\pM\s\'’-]+/u', ' ', $name) ?? '';
        $name = Str::limit(Str::squish($name), 60, '');

        return $name === '' ? 'Madame, Monsieur' : $name;
    }
}
