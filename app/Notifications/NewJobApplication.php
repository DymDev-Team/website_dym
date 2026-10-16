<?php

namespace App\Notifications;

use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewJobApplication extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public JobApplication $application)
    {
        //
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
        $offer = $this->application->job_offer_id === null
            ? 'Candidature spontanée'
            : $this->application->jobOffer->title;

        return (new MailMessage)
            ->subject("Nouvelle candidature — {$offer}")
            ->greeting('Nouvelle candidature reçue')
            ->line("{$this->application->name} a postulé : {$offer}.")
            ->line("E-mail : {$this->application->email}")
            ->when($this->application->phone, fn (MailMessage $mail) => $mail->line("Téléphone : {$this->application->phone}"))
            ->action('Voir la candidature', route('admin.applications.show', $this->application));
    }
}
