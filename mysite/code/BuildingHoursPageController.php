<?php

class BuildingHoursPageController extends PageController {

	
	private static $allowed_actions = array (
		'edit'
	);

	private static $url_handlers = array(
		'edit//' => 'edit'
	);
	public function edit(){
		return $this->renderWith(array('BuildingHoursPage_edit', 'Page'));
	}
	public function init() {
		parent::init();


	}

}