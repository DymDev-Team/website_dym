<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * E-mail proposed when a candidate enters a stage, never sent without a click.
 */
return new class extends Migration
{
    private const INTERVIEW = [
        'Invitation à un entretien – DYM Manufacture',
        <<<'TEXT'
            Bonjour {nom},

            Votre candidature a retenu notre attention et nous souhaitons vous rencontrer lors d’un entretien.

            Poste : {poste}
            Date et heure : à compléter
            Lieu : à compléter

            Merci de nous confirmer votre présence en répondant à cet e-mail.

            Cordialement,
            L’équipe DYM Manufacture
            TEXT,
    ];

    private const HIRED = [
        'Bonne nouvelle : votre candidature est retenue',
        <<<'TEXT'
            Bonjour {nom},

            Nous avons le plaisir de vous annoncer que votre candidature est retenue.

            Poste : {poste}

            Nous vous contacterons très prochainement pour convenir de la suite : date de début, documents à fournir et organisation de votre arrivée.

            Cordialement,
            L’équipe DYM Manufacture
            TEXT,
    ];

    private const REJECTED = [
        'Votre candidature chez DYM Manufacture',
        <<<'TEXT'
            Bonjour {nom},

            Nous vous remercions de l’intérêt que vous portez à DYM Manufacture et du temps consacré à votre candidature.

            Poste : {poste}

            Après une étude attentive de votre dossier, nous ne sommes pas en mesure d’y donner une suite favorable.

            Nous conservons votre candidature 2 ans à compter du dernier contact pour d’éventuelles opportunités, puis nous la supprimons. Vous pouvez demander sa suppression à tout moment en répondant à cet e-mail.

            Nous vous souhaitons pleine réussite dans vos recherches.

            Cordialement,
            L’équipe DYM Manufacture
            TEXT,
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('recruitment_stages', function (Blueprint $table) {
            $table->string('email_subject', 150)->nullable()->after('kind');
            $table->text('email_body')->nullable()->after('email_subject');
        });

        $stages = DB::table('recruitment_stages')->orderBy('position')->orderBy('id')->get(['id', 'name', 'kind']);

        foreach ([
            [$stages->firstWhere('name', 'Entretien'), self::INTERVIEW],
            [$stages->firstWhere('kind', 'hired'), self::HIRED],
            [$stages->firstWhere('kind', 'rejected'), self::REJECTED],
        ] as [$stage, [$subject, $body]]) {
            if ($stage !== null) {
                DB::table('recruitment_stages')->where('id', $stage->id)->update([
                    'email_subject' => $subject,
                    'email_body' => $body,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment_stages', function (Blueprint $table) {
            $table->dropColumn(['email_subject', 'email_body']);
        });
    }
};
