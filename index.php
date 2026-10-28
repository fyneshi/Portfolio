<?php
require_once __DIR__ . '/config.php';

$pageTitle  = 'Home';
$activePage = 'home';

$facts = [
    ['cap', 'Education', 'AMA Education System — Senior High'],
    ['target', 'Focus', 'Web Development'],
    ['book', 'Currently learning', 'PHP, MySQL & modern CSS'],
    ['star', 'Interests', 'UI design, databases, problem solving'],
];

$skills = [
    ['layout', 'HTML & CSS', 'Semantic markup and responsive layouts that work on any screen.'],
    ['database', 'PHP & MySQL', 'Server-side logic, forms and database-driven pages.'],
    ['zap', 'JavaScript', 'Interactive features and small UI enhancements.'],
    ['git', 'Git & Tools', 'Version control, XAMPP and VS Code for everyday development.'],
];

$projects = [
    ['monitor', 'Personal Portfolio', 'This website — built with PHP, MySQL and CSS, with a two-step contact form and a secure admin dashboard.', ['PHP', 'MySQL', 'CSS']],
    ['users', 'Student Records System', 'A CRUD application for managing student information and grades.', ['PHP', 'MySQL']],
    ['phone', 'Responsive Landing Page', 'A mobile-first landing page built using Flexbox and CSS Grid.', ['HTML', 'CSS']],
];

$tech = ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript'];

require __DIR__ . '/includes/header.php';
?>

<section class="hero">
    <div class="container hero-grid">
        <div class="hero-text">
            <span class="badge-pill"><span class="dot"></span> Aspiring Web Developer</span>
            <h1>Hi, I'm <span class="highlight"><?= e(OWNER_NAME) ?></span></h1>
            <p class="lead">
                Welcome to my portfolio! I'm an AMA Education System Senior High graduate who
                enjoys turning ideas into clean, functional websites.
            </p>
            <div class="hero-actions">
                <a href="contact.php" class="btn btn-primary">Get in Touch <?= icon('arrow', 18) ?></a>
                <a href="#projects" class="btn btn-outline">View My Work</a>
            </div>
            <div class="tech-row">
                <span class="tech-label">Tech I use</span>
                <?php foreach ($tech as $t): ?>
                    <span class="chip"><?= e($t) ?></span>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="hero-photo">
            <div class="photo-frame">
                <img src="images/profile.jpg" alt="Portrait of <?= e(OWNER_NAME) ?>" width="800" height="1200">
                <div class="float-card">
                    <span class="float-icon"><?= icon('cap', 20) ?></span>
                    <span>
                        <strong>Senior High Graduate</strong>
                        <small>AMA Education System</small>
                    </span>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="section" id="about">
    <div class="container about-grid">
        <div class="reveal">
            <p class="eyebrow">About me</p>
            <h2 class="section-title left">Passionate about building for the web</h2>
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
        <ul class="facts-card reveal">
            <?php foreach ($facts as [$ic, $label, $value]): ?>
                <li>
                    <span class="icon-box small"><?= icon($ic, 20) ?></span>
                    <span>
                        <small><?= e($label) ?></small>
                        <strong><?= e($value) ?></strong>
                    </span>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>

<section class="section section-alt" id="skills">
    <div class="container">
        <header class="section-head reveal">
            <p class="eyebrow">What I do</p>
            <h2 class="section-title">Skills</h2>
            <p class="section-sub">The tools and technologies I work with to bring websites to life.</p>
        </header>
        <div class="card-grid">
            <?php foreach ($skills as [$ic, $title, $desc]): ?>
                <article class="card reveal">
                    <span class="icon-box"><?= icon($ic) ?></span>
                    <h3><?= e($title) ?></h3>
                    <p><?= e($desc) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section" id="projects">
    <div class="container">
        <header class="section-head reveal">
            <p class="eyebrow">Selected work</p>
            <h2 class="section-title">Projects</h2>
            <p class="section-sub">A few things I've built while learning and practicing web development.</p>
        </header>
        <div class="card-grid projects">
            <?php foreach ($projects as $i => [$ic, $title, $desc, $tags]): ?>
                <article class="project-card reveal">
                    <div class="project-thumb thumb-<?= $i % 3 ?>">
                        <?= icon($ic, 44) ?>
                    </div>
                    <div class="project-body">
                        <h3><?= e($title) ?></h3>
                        <p><?= e($desc) ?></p>
                        <ul class="tags">
                            <?php foreach ($tags as $tag): ?>
                                <li><?= e($tag) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section cta-section">
    <div class="container">
        <div class="cta-box reveal">
            <div>
                <h2>Let's work together</h2>
                <p>Have a question, a project idea or an opportunity? I'd love to hear from you.</p>
            </div>
            <a href="contact.php" class="btn btn-light">Contact Me <?= icon('arrow', 18) ?></a>
        </div>
    </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
