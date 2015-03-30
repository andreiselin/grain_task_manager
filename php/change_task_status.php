<?php
include("init.php");




$task_status=$_POST['task_status'];




// adding comment
$edit_task_query_text = "
    UPDATE `tasks` SET
        `status` = '".$task_status['status']."'
    WHERE
        `id` = ".$task_status['id']."
    ";

$edit_task_query = $the_base->prepare($edit_task_query_text);
if($edit_task_query -> execute()){
    // everything's okay
    grain_status(
        "ok",
        "",
        "task has been successfully added"
    );
}else{
    grain_status(
        "error",
        "",
        "task hasn't been added: ".$edit_task_query_text
    );
}




?>