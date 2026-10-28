<?php

use App\Models\Project;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('each published project has its own page', function () {
    $project = Project::factory()->create(['description' => "Une fabrication sur mesure.\nUne finition soignee."]);

    $this->get(route('realisations.show', $project))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('realisation')
            ->where('project.id', $project->id)
            ->where('project.description', $project->description)
            ->where('project.image_url', $project->image_url));
});

test('unpublished and missing projects cannot be viewed', function () {
    $project = Project::factory()->create(['is_published' => false]);

    $this->get(route('realisations.show', $project))->assertNotFound();
    $this->get(route('realisations.show', 999999))->assertNotFound();
});

test('editing a project in the panel updates only its public page', function () {
    $admin = User::factory()->admin()->create();
    $project = Project::factory()->create();
    $other = Project::factory()->create(['description' => 'Autre projet']);

    $this->actingAs($admin)->put(route('admin.projects.update', $project), [
        'title' => 'Pergola personnalisee',
        'category' => $project->category,
        'description' => 'Description publique modifiee depuis le panel.',
        'is_published' => true,
    ])->assertSessionHasNoErrors()->assertRedirect(route('admin.projects.index'));

    $this->get(route('realisations.show', $project))
        ->assertInertia(fn (Assert $page) => $page
            ->where('project.title', 'Pergola personnalisee')
            ->where('project.description', 'Description publique modifiee depuis le panel.'));

    expect($other->refresh()->description)->toBe('Autre projet');
});
