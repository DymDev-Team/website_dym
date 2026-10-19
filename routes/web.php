<?php

use App\Http\Controllers\CareerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LegalPageController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Models\LegalPage;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('activites', [SiteController::class, 'activities'])->name('activities');
Route::get('realisations', [SiteController::class, 'projects'])->name('realisations');
Route::get('marques', [SiteController::class, 'brands'])->name('brands');
Route::get('actualites', [SiteController::class, 'posts'])->name('posts.index');
Route::get('actualites/{post}', [SiteController::class, 'post'])->name('posts.show');

Route::get('devis', [QuoteController::class, 'create'])->name('quotes.create');
Route::post('devis', [QuoteController::class, 'store'])->middleware('throttle:5,10')->name('quotes.store');

Route::get('carriere', [CareerController::class, 'index'])->name('careers.index');
Route::post('carriere/candidature', [CareerController::class, 'apply'])->middleware('throttle:5,10')->name('careers.apply');
Route::get('carriere/{jobOffer}', [CareerController::class, 'show'])->name('careers.show');

Route::get('{legalPage}', LegalPageController::class)
    ->whereIn('legalPage', LegalPage::SLUGS)
    ->name('legal.show');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
