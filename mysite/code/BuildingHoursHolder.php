<?php

use PageController;
class BuildingHoursHolder extends Page {

	private static $db = array(


	);

	private static $has_many = array(
	
	);

	private static $allowed_children = array(
		'BuildingHoursPage'
	);

	private static $hide_preview_panel = true;

	public function getCMSFields(){
		$fields = parent::getCMSFields();

		return $fields;

	}

	public function ActiveHoursPages(){
		$children = BuildingHoursPage::get()->filter(
			array(
				'ParentID' => $this->ID,
				'EffectiveStartDate:LessThanOrEqual' => date('Y-m-d'),
				'EffectiveEndDate:GreaterThanOrEqual' => date('Y-m-d')
			)
		);
		return $children;
	}

}
