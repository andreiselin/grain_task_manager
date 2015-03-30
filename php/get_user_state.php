<?php
include("init.php");

grain_status(
    "ok",
    array(
        "user_state" => get_user_state()
    ),
    ""
);