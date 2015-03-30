<?php
include("init.php");

// checking user
// finding out what is the request
// if the request is get

$task_id = intval($_GET['task_id']);


// getting the task
$get_task_query_text = "SELECT `id`,`title`,`content`,`time_placed`,`time_term`,`status`,`responsible`,`img`,`initiator`FROM `tasks` WHERE `id`=".$task_id;
$get_task_query = $the_base->prepare($get_task_query_text);
$get_task_query -> execute();
$get_task_result = $get_task_query -> fetch(PDO::FETCH_ASSOC);
$get_task_result['time_placed'] =   date_gtl($get_task_result['time_placed'], true);
$get_task_result['time_term'] =     date_gtl($get_task_result['time_term'], true);

// getting its comments
$get_task_comments_query_text = "SELECT `id`,`author`,`task`,`time_placed`,`content`,`img` FROM `comments` WHERE `task`=".$task_id;
$get_task_comments_query = $the_base->prepare($get_task_comments_query_text);
$get_task_comments_query -> execute();
$get_task_comments_result = $get_task_comments_query -> fetchAll(PDO::FETCH_ASSOC);

// processing comments
for($i=0; $i<count($get_task_comments_result); $i++){
    $get_task_comments_result[$i]['time_placed'] = date_gtl($get_task_comments_result[$i]['time_placed'],true);
}
// including comment in output
$get_task_result['comments'] = $get_task_comments_result;



// getting notifications
$get_task_notifications_query_text = "SELECT `id`,`comment`,`notified` FROM `notifications` WHERE `task`=".$task_id;
$get_task_notifications_query = $the_base->prepare($get_task_notifications_query_text);
$get_task_notifications_query -> execute();
$get_task_notifications_result = $get_task_notifications_query -> fetchAll(PDO::FETCH_ASSOC);
// processing comments
$get_task_result['notifications'] = $get_task_notifications_result;





// errors
// on wrong tasks count got
if($get_task_query->rowCount() != 1){
    grain_status(
        "error",
        $get_task_query->rowCount(),
        "unexpected tasks count on getting one task: ".$get_task_query->rowCount()
    );
}





// everything's okay


// marking notification as viewed if it exists


grain_status(
    "ok",
    $get_task_result,
    "task has been successfully loaded"
);

?>