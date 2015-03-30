<?php
include("init.php");



$comment = $_POST["comment"];
$comment["task_id"] = intval( $comment["task_id"] );


// mail($admin_mail, "comment", print_r($_POST, true));




// adding comment
$add_comment_query_text =
    "INSERT INTO `comments`
    (`task`,`content`,`author`,`img`)
    VALUES
    (".$comment["task_id"].",'".$comment["content"]."',".$user['id'].",'".$comment["img"]."')";

$add_comment_query = $the_base->prepare($add_comment_query_text);
$add_comment_result = $add_comment_query -> execute();
$add_comment_inserted_id = $the_base->lastInsertId();
// on not inserting
if($add_comment_result != true){
    grain_status(
        "error",
        "",
        "comment hasn't been added: ".$add_comment_query_text
    );
}




// adding notifications
add_notifications($comment["comment_notified"], $comment["task_id"], $add_comment_inserted_id);




// everything's okay
grain_status(
    "ok",
    "",
    "comment has been successfully added"
);


?>