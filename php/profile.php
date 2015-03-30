<?php

include("init.php");


// show my tasks

$tasks_page = isset($_GET['page']) ? intval($_GET['page']) : 1;


get_tasks(
    array(
        "responsible" => $user['id'],
        "status" => 1
    ),
    array(),
    $tasks_page
);