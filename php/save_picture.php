<?php
include("init.php");


$picture_name = substr(str_shuffle(md5(time())),0,16);
$picture_file = $_FILES["file"]; //



// задание максимальной ширины и высоты
$new_width = 500;
$new_height = 500;






// получение новых размеров
list($width_orig, $height_orig) = getimagesize($picture_file['tmp_name']);
$ratio_orig = $width_orig/$height_orig;
if ($ratio_orig < 1) {
    $new_width = $new_height*$ratio_orig;
} else {
    $new_height = $new_width/$ratio_orig;
}

// setting new picture
$uploaded_file = imagecreatefromjpeg($picture_file['tmp_name']);
$resampled_picture = imagecreatetruecolor($new_width, $new_height);


imagecopyresampled(
    $resampled_picture,
    $uploaded_file,
    0, 0, 0, 0,
    $new_width, $new_height,
    $width_orig, $height_orig
);

imagejpeg (
    $resampled_picture,
    home_dir("images/pictures/" . $picture_name .".jpg"),
    75
)
or
grain_status(
    "error",
    "",
    "can't save picture"
);



grain_status(
    "ok",
    array("picture_name" => $picture_name),
    ""
);