<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

/**
 * Acknowledgment sent to the candidate, with the subject and text written in
 * the recruitment settings.
 */
class ApplicationReceived extends Notification
{
    use Queueable;

    public function __construct(public string $candidateName, public ?string $offerTitle) {}

    public static function for(JobApplication $application): self
    {
        return new self((string) $application->candidate->name, $application->jobOffer?->title);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $settings = RecruitmentSetting::values();
        $variables = [
            '{nom}' => $this->safeName(),
            '{poste}' => $this->offerTitle ?? 'Candidature spontanée',
        ];

        return (new MailMessage)
            ->subject(strtr($settings['acknowledgment_subject'], $variables))
            ->when($settings['acknowledgment_reply_to'], fn (MailMessage $mail, string $address) => $mail->replyTo($address))
            ->markdown('mail.application-received', [
                'paragraphs' => self::paragraphs(strtr($settings['acknowledgment_body'], $variables)),
            ]);
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
     * The name comes from a public form: only letters, spaces, hyphens and
     * apostrophes are kept, so that no link or formatting can be slipped into
     * an e-mail sent in DYM's name to whatever address was typed.
     */
    private function safeName(): string
    {
        $name = preg_replace('/[^\pL\pM\s\'’-]+/u', ' ', $this->candidateName) ?? '';
        $name = Str::limit(Str::squish($name), 60, '');

        return $name === '' ? 'Madame, Monsieur' : $name;
    }
}
