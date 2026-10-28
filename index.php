<?php
require_once __DIR__ . '/config.php';

$pageTitle  = 'Home';
$activePage = 'home';

$skills = [
    ['HTML & CSS', 'Semantic markup and responsive layouts that work on any screen.'],
    ['PHP & MySQL', 'Server-side logic, forms and database-driven pages.'],
    ['JavaScript', 'Interactive features and small UI enhancements.'],
    ['Git & Tools', 'Version control, XAMPP and VS Code for everyday development.'],
];

$projects = [
    ['Personal Portfolio', 'This website — built with PHP, MySQL and CSS, with a contact form and an admin dashboard.', ['PHP', 'MySQL', 'CSS']],
    ['Student Records System', 'A CRUD application for managing student information and grades.', ['PHP', 'MySQL']],
    ['Responsive Landing Page', 'A mobile-first landing page built using Flexbox and CSS Grid.', ['HTML', 'CSS']],
];

require __DIR__ . '/includes/header.php';
?>

<section class="hero">
    <div class="container hero-grid">
        <div class="hero-text">
            <p class="eyebrow">Welcome to my portfolio</p>
            <h1>Hi, I'm <span class="highlight"><?= e(OWNER_NAME) ?></span></h1>
            <p class="lead">
                An aspiring web developer and AMA Education System Senior High graduate who
                enjoys turning ideas into clean, functional websites.
            </p>
            <div class="hero-actions">
                <a href="contact.php" class="btn btn-primary">Get in Touch</a>
                <a href="#projects" class="btn btn-outline">View My Work</a>
            </div>
        </div>
        <div class="hero-photo">
            <img src="images/profile.jpg" alt="Portrait of <?= e(OWNER_NAME) ?>" width="800" height="1200">
        </div>
    </div>
</section>

<section class="section" id="about">
    <div class="container narrow">
        <h2 class="section-title">About Me</h2>
        <p>
            I'm a recent senior high school graduate with a strong interest in technology and web
            development. I like learning how websites work behind the scenes — from designing the
            layout with CSS to storing and retrieving data with PHP and MySQL.
        </p>
        <p>
            I'm currently building my skills through school projects and personal practice, and I'm
            always looking for new challenges that help me grow as a developer.
        </p>
    </div>
</section>

<section class="section section-alt" id="skills">
    <div class="container">
        <h2 class="section-title">Skills</h2>
        <div class="card-grid">
            <?php foreach ($skills as [$title, $desc]): ?>
                <article class="card">
                    <h3><?= e($title) ?></h3>
                    <p><?= e($desc) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section" id="projects">
    <div class="container">
        <h2 class="section-title">Projects</h2>
        <div class="card-grid">
            <?php foreach ($projects as [$title, $desc, $tags]): ?>
                <article class="card">
                    <h3><?= e($title) ?></h3>
                    <p><?= e($desc) ?></p>
                    <ul class="tags">
                        <?php foreach ($tags as $tag): ?>
                            <li><?= e($tag) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section cta">
    <div class="container narrow center">
        <h2>Let's work together</h2>
        <p>Have a question or an opportunity? I'd love to hear from you.</p>
        <a href="contact.php" class="btn btn-primary">Contact Me</a>
    </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
