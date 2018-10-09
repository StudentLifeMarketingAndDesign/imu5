<?php

class BuildingHoursHolderController extends PageController {

	
	private static $allowed_actions = array (
		'edit'
	);

	private static $url_handlers = array(
		'edit//' => 'edit'
	);
	public function edit(){
		return $this->renderWith(array('BuildingHoursHolder_edit', 'Page'));
	}

	public function init() {
		parent::init();


	}

}