<?php

namespace App\Notifications;

use App\Models\QuoteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewQuoteRequest extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public QuoteRequest $quote)
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
        $from = $this->quote->company ? "{$this->quote->name} ({$this->quote->company})" : $this->quote->name;

        return (new MailMessage)
            ->subject('Nouvelle demande de devis — '.($this->quote->activity ?? $from))
            ->replyTo($this->quote->email, $this->quote->name)
            ->greeting('Nouvelle demande de devis')
            ->line("{$from} demande un devis.")
            ->when($this->quote->activity, fn (MailMessage $mail) => $mail->line("Activité : {$this->quote->activity}"))
            ->line("E-mail : {$this->quote->email}")
            ->line("Téléphone : {$this->quote->phone}")
            ->when($this->quote->deadline, fn (MailMessage $mail) => $mail->line("Délai souhaité : {$this->quote->deadline}"))
            ->action('Voir la demande', route('admin.quotes.show', $this->quote));
    }
}
