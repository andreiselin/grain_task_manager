<?php
$free_query = true;
include("init.php");

// this is taking auth type and details from front-end and

// auth type differentiation is about to arrive here once

// username and password are required
$user = array(
    "id"  => intval($_POST['user_id']),
    "pwd" => md5($_POST['user_pwd'])
);



$auth_user_query_text = "SELECT `pwd`, `role` FROM `users` WHERE `id` = ".$user['id'];
$auth_user_query = $the_base -> prepare($auth_user_query_text);
$auth_user_query -> execute();


if($auth_user_query -> rowCount() == 1){

    $auth_user_result = $auth_user_query -> fetch(PDO::FETCH_ASSOC);

    if($auth_user_result["pwd"] == $user['pwd']){
        // updating auth key
        $user['new_auth_key'] = substr(str_shuffle(md5(time())),0,8);
        $auth_key_update_query = $the_base -> prepare("UPDATE `users` SET `auth_key`='".$user['new_auth_key']."' WHERE `id` = ".$user['id']);

        // auth_key update is successful
        if($auth_key_update_query -> execute()) {

            setcookie ("user_id", $user['id'], time()+3600*10, "/");
            setcookie ("user_role", $auth_user_result['role'], time()+3600*10, "/");
            setcookie ("auth_key", $user['new_auth_key'], time()+3600*10, "/");


            grain_status(
                "ok",
                "",
                "user is authorised"
            );
        }else{ // update query has failed
            grain_status(
                "error",
                array("message" => "system error"),
                "auth_key update error"
            );
        }
    }else{ // password mismatches
        grain_status(
            "error",
            array("message" => "not_authorised"),
            "user is not authorised"
        );
    }
}else{ // no user found
    grain_status(
        "error",
        array("message" => "not_authorised"),
        "user is not found: ".$auth_user_query_text
    );
}