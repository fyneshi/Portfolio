<?php
require_once __DIR__ . '/../config.php';

// Only accessible after a successful login
if (empty($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}

$messages = [];
$dbError  = false;

$pdo = db();
if ($pdo === null) {
    $dbError = true;
} else {
    try {
        $messages = $pdo->query('SELECT id, name, email, message, date_sent FROM contact_messages ORDER BY date_sent DESC, id DESC')->fetchAll();
    } catch (PDOException $e) {
        error_log('Fetch failed: ' . $e->getMessage());
        $dbError = true;
    }
}

// Summary numbers for the stat cards
$today    = date('Y-m-d');
$weekAgo  = strtotime('-7 days');
$stats = [
    ['inbox', 'Total messages', count($messages)],
    ['calendar', 'Received today', count(array_filter($messages, fn($m) => substr($m['date_sent'], 0, 10) === $today))],
    ['clock', 'Last 7 days', count(array_filter($messages, fn($m) => strtotime($m['date_sent']) >= $weekAgo))],
];

$pageTitle  = 'Admin Dashboard';
$activePage = 'admin';
$basePath   = '../';
require __DIR__ . '/../includes/header.php';
?>

<section class="section dashboard">
    <div class="container">
        <div class="dashboard-head">
            <div>
                <p class="eyebrow">Admin panel</p>
                <h1>Dashboard</h1>
                <p class="muted">Logged in as <strong><?= e($_SESSION['admin_username']) ?></strong></p>
            </div>
            <form method="post" action="logout.php">
                <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                <button type="submit" class="btn btn-danger"><?= icon('logout', 18) ?> Logout</button>
            </form>
        </div>

        <div class="stats-grid">
            <?php foreach ($stats as [$ic, $label, $value]): ?>
                <div class="stat-card">
                    <span class="icon-box"><?= icon($ic) ?></span>
                    <div>
                        <strong><?= $value ?></strong>
                        <small><?= e($label) ?></small>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="panel">
            <div class="panel-head">
                <h2>Contact Messages</h2>
                <?php if ($messages): ?>
                    <label class="search-box">
                        <?= icon('search', 18) ?>
                        <input type="search" id="message-search" placeholder="Search messages..." aria-label="Search messages">
                    </label>
                <?php endif; ?>
            </div>

            <?php if ($dbError): ?>
                <div class="alert alert-error" role="alert">Could not load messages from the database.</div>
            <?php elseif (!$messages): ?>
                <div class="empty-state">
                    <?= icon('inbox', 40) ?>
                    <p>No contact messages yet.</p>
                </div>
            <?php else: ?>
                <div class="table-wrap">
                    <table class="data-table" id="messages-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Message</th>
                                <th>Date Sent</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($messages as $i => $row): ?>
                                <tr>
                                    <td data-label="#"><?= $i + 1 ?></td>
                                    <td data-label="Name" class="name-cell">
                                        <span class="name-wrap">
                                            <span class="avatar"><?= e(mb_strtoupper(mb_substr($row['name'], 0, 1))) ?></span>
                                            <?= e($row['name']) ?>
                                        </span>
                                    </td>
                                    <td data-label="Email"><a href="mailto:<?= e($row['email']) ?>"><?= e($row['email']) ?></a></td>
                                    <td data-label="Message" class="msg-cell"><?= nl2br(e($row['message'])) ?></td>
                                    <td data-label="Date Sent" class="date-cell"><?= e(date('M j, Y g:i A', strtotime($row['date_sent']))) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <p class="no-results" hidden>No messages match your search.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>

<?php require __DIR__ . '/../includes/footer.php'; ?>
