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

$pageTitle  = 'Admin Dashboard';
$activePage = 'admin';
$basePath   = '../';
require __DIR__ . '/../includes/header.php';
?>

<section class="section">
    <div class="container">
        <div class="dashboard-head">
            <div>
                <h1>Admin Dashboard</h1>
                <p class="muted">Logged in as <strong><?= e($_SESSION['admin_username']) ?></strong> &middot; <?= count($messages) ?> message(s)</p>
            </div>
            <form method="post" action="logout.php">
                <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                <button type="submit" class="btn btn-danger">Logout</button>
            </form>
        </div>

        <?php if ($dbError): ?>
            <div class="alert alert-error" role="alert">Could not load messages from the database.</div>
        <?php elseif (!$messages): ?>
            <div class="empty-state">No contact messages yet.</div>
        <?php else: ?>
            <div class="table-wrap">
                <table class="data-table">
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
                                <td data-label="Name"><?= e($row['name']) ?></td>
                                <td data-label="Email"><a href="mailto:<?= e($row['email']) ?>"><?= e($row['email']) ?></a></td>
                                <td data-label="Message" class="msg-cell"><?= nl2br(e($row['message'])) ?></td>
                                <td data-label="Date Sent"><?= e(date('M j, Y g:i A', strtotime($row['date_sent']))) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php require __DIR__ . '/../includes/footer.php'; ?>
