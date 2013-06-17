<?php
	/*
		Draw images using text and pictures from Font Awesome using PHP
	*/
	$icons = array( 'cloud' => json_decode('"'.'\uf0c2'.'"'), 
					'camera' => json_decode('"'.'\uf030'.'"'),
					'video' => json_decode('"'.'\uf03d'.'"'),
					'upload' => json_decode('"'.'\uf01b'.'"'),
					'arrow-right' => json_decode('"'.'\uf061'.'"')
					);
	
	function textItem($x, $y, $text, $color = 'red', $size = 1.0, $z = 0, $font = './fontRoboto.ttf'){
		$item = array();
		$item['x'] = $x;
		$item['y'] = $y;
		$item['z'] = $z;
		$item['text'] = $text;
		$item['color'] = $color;
		$item['size'] = $size;
		$item['font'] = $font;
		$item['type'] = 'text';
		return $item;
	}
	
	function pictureItem($x, $y, $icon, $color = 'red', $size = 1.0, $z = 0){
		$item = textItem($x,$y,$icon,$color,$size,$z);
		$item['type'] = 'awesome';
		return $item;
	}
	
	function newUID() { 
		$s = strtoupper(md5(uniqid(rand(),true))); 
		$guidText = 
			substr($s,0,8) . '-' . 
			substr($s,8,4) . '-' . 
			substr($s,12,4). '-' . 
			substr($s,16,4). '-' . 
			substr($s,20); 
		return $guidText;
	}

	function drawAwesomeImage( $items, $width = 500, $height = 500, $path = '', $backColor = 'none' )
	{ 
		/* Create Imagick objects */
		$image = new Imagick();
		$draw = new ImagickDraw();
		$background = new ImagickPixel(); // Transparent
		$background->setColor( $backColor );

		/* Font properties */
		$draw->setStrokeAntialias(true);
		$draw->setTextAntialias(true);
		$draw->setGravity (Imagick::GRAVITY_NORTHWEST );

		// Sort by 'z' index
		usort($items, function($a, $b) {return $a['z'] > $b['z'];});
		
		foreach ($items as $item){
			// Font selection
			if($item['type'] == 'text')		$draw->setFont($item['font']);
			if($item['type'] == 'awesome')	$draw->setFont('./fontAwesome.ttf');
			
			// Placement
			$x = floatval($item['x']) * $width;
			$y = floatval($item['y']) * $width;
			
			// Size
			$fontSize = floatval($item['size']) * ($width / 10);
			$draw->setFontSize( $fontSize );
			
			// Color
			$draw->setFillColor($item['color']);
			
			// Draw!
			$draw->annotation($x, $y, $item['text']);
		}
		
		/* Create image */
		$image->newImage($width, $height, $background);
		$image->setImageFormat('png');
		$image->drawImage( $draw );

		/* Save image */
		$uid = newUID();
		$filename = $path.$uid.'.png';
		file_put_contents($filename, $image);
		return $filename;
	}
?>
