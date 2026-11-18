<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use App\Recruitment\CandidateMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

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

        return CandidateMail::message(
            CandidateMail::fill($settings['acknowledgment_subject'], $this->candidateName, $this->offerTitle),
            CandidateMail::fill($settings['acknowledgment_body'], $this->candidateName, $this->offerTitle),
        );
    }
}
