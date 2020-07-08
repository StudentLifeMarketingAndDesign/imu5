<?php

use SilverStripe\UserForms\Model\UserDefinedForm;
use SilverStripe\Forms\CheckboxField;

class MeetingRoomHolder extends Page {


	private static $has_one = array(

	);

	private static $allowed_children = array(
		'MeetingRoomPage',
		'CompareRoomsPage',
		UserDefinedForm::class
	);

	public function getCMSFields(){
		$fields = parent::getCMSFields();

		return $fields;
	}

	public function Rooms(){
		return MeetingRoomPage::get()->filter(array('ParentID' => $this->ID));
	}

}
