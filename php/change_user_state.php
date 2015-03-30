<?php
include("init.php");

// state to write
$state_to_write = $_GET['state'];   // state to write :: 1 = start, 0 = end

$stored_state = get_user_state();

if($stored_state == 0 and $state_to_write == 0){
    grain_status(
        "surprise",
        array("message" => "already_logged_out"),
        ""
    );
}

if($stored_state == 1 and $state_to_write == 1){
    grain_status(
        "surprise",
        array("message" => "already_logged_in"),
        ""
    );
}

$new_user_state = $stored_state == 0 ? 1 : 0;

// adding new state
$add_user_state_query_text = "
    INSERT INTO `user_states`
    (
      `user`,
      `state`,
      `time`
    )
    VALUES
    (
      ".$user['id'].",
      '".$new_user_state."',
      '".date_stg(date("Y-m-d H:i:s"))."'
    )";

$add_user_state_query = $the_base->prepare($add_user_state_query_text);
if($add_user_state_query -> execute()) {
    setcookie ("user_state", $new_user_state, time()+3600*24, "/");
    grain_status(
        "ok",
        array("new_state" => $new_user_state),
        ""
    );
}else{
    grain_status(
        "error",
        "",
        "user state hasn't been added: ".$add_user_state_query_text
    );
}