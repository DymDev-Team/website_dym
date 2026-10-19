<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EquipmentController;
use App\Http\Controllers\Admin\JobApplicationController;
use App\Http\Controllers\Admin\JobOfferController;
use App\Http\Controllers\Admin\LegalPageController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\QuoteRequestController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SiteTextController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', EnsureUserIsAdmin::class])
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::resource('activities', ActivityController::class)->except('show');
        Route::resource('projects', ProjectController::class)->except('show');
        Route::resource('posts', PostController::class)->except('show');
        Route::resource('equipment', EquipmentController::class)->except('show');
        Route::resource('partners', PartnerController::class)->except('show');
        Route::resource('brands', BrandController::class)->except('show');
        Route::resource('testimonials', TestimonialController::class)->except('show');

        Route::resource('job-offers', JobOfferController::class)->except('show');
        Route::get('applications/{application}/cv', [JobApplicationController::class, 'cv'])->name('applications.cv');
        Route::resource('applications', JobApplicationController::class)->only(['index', 'show', 'update', 'destroy']);

        Route::get('quotes/{quote}/attachment', [QuoteRequestController::class, 'attachment'])->name('quotes.attachment');
        Route::resource('quotes', QuoteRequestController::class)->only(['index', 'show', 'update', 'destroy']);

        Route::resource('legal-pages', LegalPageController::class)->only(['index', 'edit', 'update']);

        Route::get('media', [MediaController::class, 'index'])->name('media.index');
        Route::get('media/browse', [MediaController::class, 'browse'])->name('media.browse');
        Route::post('media', [MediaController::class, 'store'])->name('media.store');
        Route::delete('media', [MediaController::class, 'destroy'])->name('media.destroy');

        Route::get('texts', [SiteTextController::class, 'edit'])->name('texts.edit');
        Route::put('texts', [SiteTextController::class, 'update'])->name('texts.update');

        Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

        Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
    });
