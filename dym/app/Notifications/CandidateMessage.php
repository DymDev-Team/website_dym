<?php

namespace App\Notifications;

use App\Recruitment\CandidateMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * E-mail written or checked by the team, sent from the pipeline.
 */
class CandidateMessage extends Notification
{
    use Queueable;

    public function __construct(public string $subject, public string $body) {}

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
        return CandidateMail::message($this->subject, $this->body);
    }
}
