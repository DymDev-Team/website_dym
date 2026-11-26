<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RecordSitePageView
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET')
            || $response->getStatusCode() !== Response::HTTP_OK
            || $request->headers->has('X-Inertia-Partial-Component')
            || str_contains($request->header('Purpose', '').' '.$request->header('Sec-Purpose', ''), 'prefetch')
            || $request->user()?->is_admin) {
            return $response;
        }

        $section = match ($request->route()->getName()) {
            'activities.show' => 'activities',
            'realisations.show' => 'realisations',
            'posts.show' => 'posts.index',
            'careers.show' => 'careers.index',
            default => $request->route()->getName(),
        };

        try {
            DB::table('site_page_views')->upsert(
                ['viewed_on' => today()->toDateString(), 'section' => $section, 'views' => 1],
                ['viewed_on', 'section'],
                ['views' => DB::raw('site_page_views.views + 1')],
            );
        } catch (QueryException $exception) {
            report($exception);
        }

        return $response;
    }
}
