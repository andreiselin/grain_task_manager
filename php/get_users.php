<?php
$free_query = true;
include_once("init.php");



$get_user_list_query = $the_base->prepare("SELECT `id`, `first_name`, `last_name`, `post`, `role` FROM `users`");
$get_user_list_query -> execute();
$get_user_list_results = $get_user_list_query -> fetchAll(PDO::FETCH_ASSOC);



$user_list_count = $get_user_list_query->rowCount();
if($user_list_count > 0){
    grain_status(
        "ok",
        $get_user_list_results,
        $user_list_count. " users loaded"
    );
}else{
    grain_status(
        "error",
        "",
        "unexpected users count on getting user list: ".$user_list_count
    );
}
