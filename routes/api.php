<?php

use App\Http\Controllers\DeployController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:10,1')->group(function () {
    Route::post('deploy', DeployController::class)->name('api.deploy');
    Route::post('deploy/git', [DeployController::class, 'gitMirror'])->name('api.deploy.git');
    Route::get('deploy/probe', [DeployController::class, 'probe'])->name('api.deploy.probe');
});
