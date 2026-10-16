<?php
try {
    $pdo = new PDO('mysql:host=aescisyny.mysql.db;dbname=aescisyny;charset=utf8', 'aescisyny', 'Synylodge2024');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $newsId = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    // Récupération des détails du news
    $sql = '
      SELECT n.id, n.title, n.description, n.created_at, ni.image_path
      FROM news n
      LEFT JOIN news_images ni ON n.id = ni.news_id
      WHERE n.id = :id
  ';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $newsId]);
    $news = $stmt->fetch(PDO::FETCH_ASSOC);

    if (! $news) {
        exit('News not found.');
    }

    // Récupérer toutes les images
    $images = [];
    $stmt = $pdo->query("SELECT image_path FROM news_images WHERE news_id = $newsId");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $images[] = $row['image_path'];
    }

    $news['images'] = $images;

} catch (PDOException $e) {
    echo 'Error: '.$e->getMessage();
    exit;
}
?>


<!DOCTYPE html>
<html class="wide wow-animation" lang="en">
  <head>
    <title>DYM | ACTUALITES</title>
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="utf-8">
    <link rel="icon" href="images/logo.png" type="image/x-icon">
    <!-- head section -->
    <link rel="stylesheet" href="css/bootstrap.css">
    <link rel="stylesheet" href="css/fonts.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/owl.carousel.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Roboto:100,300,300i,400,500,600,700,900%7CRaleway:500">
        <style>
                .rd-dropdown-link {
  cursor: pointer; /* Affiche le curseur en forme de main */
}
        .preloader {
            position: fixed; /* Fixe le préchargeur à l'écran */
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f7f7f8; /* Couleur de fond pour les zones sans vidéo */
            display: flex; /* Utilisation de Flexbox pour centrer la vidéo */
            align-items: center; /* Centre verticalement */
            justify-content: center; /* Centre horizontalement */
            z-index: 9999; /* Assurez-vous que le préchargeur est au-dessus des autres éléments */
            transition: opacity 0.5s ease-out; /* Transition pour un effet de fondu */
        }

        .preloader.hidden {
            opacity: 0;
            visibility: hidden; /* Assure que le préchargeur est invisible et n'affecte pas la mise en page */
        }

        .preloader video {
            width: 100%; /* Ajuste la largeur de la vidéo */
            height: auto; /* Maintient le ratio de la vidéo */
            object-fit: cover; /* Couvre la zone sans déformer la vidéo */
        }


        </style>
    </head>
  <body>
    <div id="preloader" class="preloader">
      <video autoplay muted loop>
          <source src="3.mp4" type="video/mp4">
          Votre navigateur ne supporte pas la balise vidéo.
      </video>
  </div>
    <div class="page">
      <!-- Page Header-->
      <header class="section page-header">
        <!-- RD Navbar-->
        <div class="rd-navbar-wrap">
          <nav class="rd-navbar rd-navbar-creative context-dark" data-layout="rd-navbar-fixed" data-sm-layout="rd-navbar-fixed" data-md-layout="rd-navbar-fixed" data-md-device-layout="rd-navbar-fixed" data-lg-layout="rd-navbar-static" data-lg-device-layout="rd-navbar-fixed" data-xl-layout="rd-navbar-static" data-xl-device-layout="rd-navbar-static" data-xxl-layout="rd-navbar-static" data-xxl-device-layout="rd-navbar-static" data-lg-stick-up-offset="80px" data-xl-stick-up-offset="80px" data-xxl-stick-up-offset="80px" data-lg-stick-up="true" data-xl-stick-up="true" data-xxl-stick-up="true">
            <div class="rd-navbar-collapse-toggle rd-navbar-fixed-element-1" data-rd-navbar-toggle=".rd-navbar-collapse"><span></span></div>
            <div class="rd-navbar-main-outer">
              <div class="rd-navbar-main">
                <!-- RD Navbar Panel-->
                <div class="rd-navbar-panel">
                  <!-- RD Navbar Toggle-->
                  <button class="rd-navbar-toggle" data-rd-navbar-toggle=".rd-navbar-nav-wrap"><span></span></button>
                  <!-- RD Navbar Brand-->
                  <div class="rd-navbar-brand">
                      <!--Brand--><a class="brand" href="index.html"><img class="brand-logo-dark" src="images/logoblanc.png" alt="" width="213" height="27"/><img class="brand-logo-light" src="images/logoblanc.png" alt="" width="213" height="27"/></a>
                    </div>
                </div>
                <div class="rd-navbar-main-element">
                    <div class="rd-navbar-nav-wrap">
                      <!-- RD Navbar Nav-->
                      <ul class="rd-navbar-nav">
                        <li class="rd-nav-item"><a class="rd-nav-link" href="##">Dym Manufacture </a>
                        </li>
                        <li class="rd-nav-item"><a class="rd-nav-link" href="javascript:void(0)">Activités</a>
                          <!-- RD Navbar Dropdown-->
                          <ul class="rd-menu rd-navbar-dropdown">
                            <li class="rd-dropdown-item"><a class="rd-dropdown-link" href="menusuirie.html">MENUISERIE METALLIQUE</a></li>
                            <li class="rd-dropdown-item"><a class="rd-dropdown-link" href="agricole.html">UNITE DE TRANSFORMATION</a></li>
                            <li class="rd-dropdown-item"><a class="rd-dropdown-link" href="usinage.html">USINAGE DE PIECES METALLIQUES</a></li>
                            <li class="rd-dropdown-item"><a class="rd-dropdown-link" href="art.html">ART METALLIQUE CREATIF</a></li>
                          </ul>
                        </li>
                        <li class="rd-nav-item">
                          <a class="rd-nav-link" href="javascript:void(0)">Catalogues</a>
                          <!-- RD Navbar Dropdown-->
                          <ul class="rd-menu rd-navbar-dropdown">
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="javascript:void(0)">AUVENT</a>
                            </li>
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="uploads/nos_catalogues/DYM_MANUFACTURE_CATALOGUE_PORTAIL.pdf">PORTAIL</a>
                            </li>
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="uploads/nos_catalogues/DYM_MANUFACTURE_CATALOGUE_PERGOLA.pdf">PERGOLA</a>
                            </li>
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="uploads/nos_catalogues/DYM_MANUFACTURE_CATALOGUE_BRISE_VUE.pdf">BRISE VUE</a>
                            </li>
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="javascript:void(0)">CHARPENTE</a>
                            </li>
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="uploads/nos_catalogues/DYM_MANUFACTURE_CATALOGUE_RAMPES_GARDE_CORPS.pdf">RAMPES & GARDE CORPS</a>
                            </li>
                          </ul>
                        </li>
                        
                        <li class="rd-nav-item">
                          <a class="rd-nav-link" href="javascript:void(0)">Motifs</a>
                          <!-- RD Navbar Dropdown-->
                          <ul class="rd-menu rd-navbar-dropdown">
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="uploads/nos_motifs/DYM_MANUFACTURE_MOTIF_ABSTRAIT.pdf">THEME ABSTRAIT</a>
                            </li>
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="uploads/nos_motifs/DYM_MANUFACTURE_MOTIF_MOSAIQUE.pdf">THEME MOSAIQUE</a>
                            </li>
                            <li class="rd-dropdown-item">
                              <a class="rd-dropdown-link" data-url="uploads/nos_motifs/DYM_MANUFACTURE_MOTIF_NATURE.pdf">THEME NATURE</a>
                            </li>
                          </ul>
                        </li>
                        <li class="rd-nav-item active"><a class="rd-nav-link" href="grid-blog.php">Actualités</a>
                        </li>
                      </ul>
                    </div>
                    <div class="rd-navbar-collapse">
                      <ul class="rd-navbar-contacts-3">
                        <li><a class="phone" href="tel:#">+225 078-930-3000</a></li>
                        <li><a class="mail" href="mailto:#">info@dym.ci</a></li>
                    </ul><a class="button button-xs button-outline button-default-outline-2 button-winona" href="/contacts"><span class="button-text">Obtenez un devis</span><span class="icon linearicons-pencil"></span></a>
                    </div>
                  </div>
              </div>
            </div>
          </nav>
        </div>
      </header>
      <!-- Breadcrumbs -->
      <section class="bg-gray-7">
        <div class="breadcrumbs-custom box-transform-wrap context-dark">
          <div class="container">
            <h3 class="breadcrumbs-custom-title">ACTUALITES</h3>
            <div class="breadcrumbs-custom-decor"></div>
          </div>
          <div class="box-transform" style="background-image: url(images/bg-breadcrumbs.jpg);"></div>
        </div>
        <div class="container">
          <ul class="breadcrumbs-custom-path">
            <li><a href="index.html">Home</a></li>
            <li><a href="grid-blog.php">ACTUALITES</a></li>
          </ul>
        </div>
      </section>
      <!-- Grid Blog-->
      <main class="py-16">
        <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">Actualités</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <?php
                try {
                    $pdo = new PDO('mysql:host=aescisyny.mysql.db;dbname=aescisyny;charset=utf8', 'aescisyny', 'Synylodge2024');
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                    $sql = '
                        SELECT n.id, n.title, n.description, ni.image_path
                        FROM news n
                        LEFT JOIN news_images ni ON n.id = ni.news_id
                        WHERE ni.id = (
                            SELECT MIN(ni2.id) FROM news_images ni2 WHERE ni2.news_id = n.id
                        )
                        ORDER BY n.created_at DESC
                    ';
                    $stmt = $pdo->query($sql);
                    $newsItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($newsItems as $news) {
                        $description = strlen($news['description']) > 100 ? substr($news['description'], 0, 100).'...' : $news['description'];
                        echo '<div class="news-card bg-white rounded-lg overflow-hidden shadow-lg">';
                        echo '<a href="news_details.php?id='.htmlspecialchars($news['id']).'">';
                        echo '<img src="'.htmlspecialchars($news['image_path']).'" alt="'.htmlspecialchars($news['title']).'" class="w-full">';
                        echo '</a>';
                        echo '<div class="news-card-content">';
                        echo '<h2 class="news-card-title">'.htmlspecialchars($news['title']).'</h2>';
                        echo '<p class="news-card-description">'.htmlspecialchars($description).'</p>';
                        echo '<a href="news_details.php?id='.htmlspecialchars($news['id']).'" class="news-card-link">Lire la suite</a>';
                        echo '</div>';
                        echo '</div>';
                    }
                } catch (PDOException $e) {
                    echo 'Erreur : '.$e->getMessage();
                }
?>
            </div>
        </div>
    </main>



      <!-- Page Footer-->
      <footer class="section footer-corporate context-dark">
        <div class="container">
          <div class="section-lg">
            <div class="row row-50 justify-content-sm-between">
              <div class="col-sm-6 col-md-4 col-xl-3">
                <h6 class="footer-corporate-title oh-desktop"><span class="d-inline-block wow slideInUp">À PROPOS DE NOUS</span></h6>
                <p class="wow fadeInRight">Chez DYM Manufacture, l'excellence est notre maître-mot. Chaque pièce que nous réalisons est le résultat d'un savoir-faire artisanal allié aux technologies les plus avancées.</p>
                <ul class="list-inline footer-social-list footer-social-list-2 footer-social-list-4">
          <li><a class="icon mdi mdi-facebook" href="https://www.facebook.com/dymanufacture/" target="_blank"></a></li>
          <li><a class="icon mdi mdi-instagram" href="https://www.instagram.com/dym_manufacture?igsh=M2hrZWxqazA4aTJo" target="_blank"></a></li>
                </ul>
              </div>
              <div class="col-sm-5 col-md-4 col-lg-3">
                <h6 class="footer-corporate-title oh-desktop"><span class="d-inline-block wow slideInUp">CONTACT</span></h6>
                <ul class="footer-creative-contacts d-inline-block d-md-block">
                  <li class="wow fadeInLeft">
                    <p class="footer-creative-contacts-title">CONSULTATION GRATUITE</p><a class="phone" href="tel:#">+225 078-930-3000</a>
                  </li>
                  <li class="wow fadeInLeft" data-wow-delay=".05s">
                    <p class="footer-creative-contacts-title">Addresse</p><a class="address" href="#">Abidjan, CHU Angre<br>28 BP 1061 Abidjan 28</a>
                  </li>
                  <li class="wow fadeInLeft" data-wow-delay=".1s">
                    <p class="footer-creative-contacts-title">E-mail</p><a class="mail" href="mailto:#">info@dym.ci</a>
                  </li>
                </ul>
              </div>
              <div class="col-md-4">
                <h6 class="footer-corporate-title oh-desktop"><span class="d-inline-block wow slideInUp">LIENS UTILES</span></h6>
                <ul class="footer-corporate-list d-inline-block d-sm-block wow fadeInUp">
                  <li><a href="##">Notre Histoire</a></li>
                  <li><a href="grid-blog.php">Actualités</a></li>
                               <li><a href="/contacts">Contactez-nous</a></li>

                  <li><a href="agricole.html">Unité de transformation</a></li>
                  <li><a href="usinage.html">Usinage de Pièces métallurgiques</a></li>
                  <li><a href="art.html">Art Métalique Créatif</a></li>
                  <li><a href="menusuirie.html">Ouvrage métallique</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-corporate-panel">
          <div class="container">
            <!-- Rights-->
            <p class="rights"><span>&copy;&nbsp;</span><span class="copyright-year"></span><span>.&nbsp;</span><span>All Rights Reserved</span><span>.&nbsp;</span><a href="privacy-policy.html"></a></p>
          </div>
        </div>
      </footer>
    </div>
    <!-- Modal -->
<div id="newsModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <div id="modalTitle"></div>
    <div id="modalDescription"></div>
    <div id="modalImages"></div>
  </div>
</div>

    <!-- Global Mailform Output-->
    <div class="snackbars" id="form-output-global"></div>
    <!-- Javascript-->
   <!-- before closing body tag -->
<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
<script src="js/owl.carousel.min.js"></script>
<script src="js/scripts.js"></script>
<script src="js/core.min.js"></script>
<script src="js/script.js"></script>
</script>
  <!-- Google Tag Manager --><noscript><iframe src="//www.googletagmanager.com/ns.html?id=GTM-P9FT69" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-P9FT69');</script><!-- End Google Tag Manager --></body>
  <script>
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            // Ajoute la classe 'hidden' pour lancer la transition de fondu
            setTimeout(() => {
                preloader.classList.add('hidden');
                // Cache complètement le préchargeur après un délai pour permettre à la transition de se terminer
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500); // Correspond à la durée de la transition en CSS
            }, 5000); // 5 secondes après le chargement complet
        }
    });
  </script>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.rd-dropdown-link').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault(); // Empêche le comportement par défaut
      const url = this.getAttribute('data-url'); // Récupère l'URL depuis data-url
      if (url && !url.startsWith('javascript:')) {
        window.open(url, '_blank'); // Ouvre l'URL dans un nouvel onglet
      }
    });
  });
});

    </script>

</html>