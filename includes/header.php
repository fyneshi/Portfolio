<?php
// Expects $pageTitle, $activePage and optional $basePath ('' or '../')
$basePath = $basePath ?? '';
$links = [
    'home'    => ['Home', 'index.php'],
    'contact' => ['Contact', 'contact.php'],
    'admin'   => ['Admin', 'admin/login.php'],
];
$initials = implode('', array_map(fn($w) => mb_substr($w, 0, 1), explode(' ', OWNER_NAME)));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Portfolio of <?= e(OWNER_NAME) ?>, aspiring web developer.">
    <title><?= e($pageTitle) ?> | <?= e(OWNER_NAME) ?></title>
    <script>document.documentElement.classList.add('js');</script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= $basePath ?>css/style.css">
    <script src="<?= $basePath ?>js/main.js" defer></script>
</head>
<body>
<a href="#main" class="skip-link">Skip to content</a>
<header class="site-header">
    <div class="container nav-wrap">
        <a href="<?= $basePath ?>index.php" class="logo">
            <span class="logo-mark"><?= e($initials) ?></span>
            <span class="logo-text"><?= e(OWNER_NAME) ?></span>
        </a>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu">
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"><span></span></label>
        <nav class="main-nav" aria-label="Main">
            <ul>
                <?php foreach ($links as $key => [$label, $href]): ?>
                    <li><a href="<?= $basePath . $href ?>"<?= $activePage === $key ? ' class="active" aria-current="page"' : '' ?>><?= $label ?></a></li>
                <?php endforeach; ?>
            </ul>
        </nav>
    </div>
</header>
<main id="main">
