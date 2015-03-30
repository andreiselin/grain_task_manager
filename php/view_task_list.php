<?php
include("init.php");


/*
        responsible
        status
        time_from
        time_to
*/


$tasks_page = isset($_GET['page']) ? intval($_GET['page']) : 1;

$filters = array();
foreach($_GET as $key=>$value){
    $filters[$key] = $value;
}



//////////////////////



get_tasks(
    $filters,
    array(),
    $tasks_page
);