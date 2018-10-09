<?php

use SilverStripe\UserForms\Model\UserDefinedForm;

class MeetingRoomHolder extends Page {

	private static $db = array(
		
	);

	private static $has_one = array(

	);

	private static $allowed_children = array(
		'MeetingRoomPage',
		'CompareRoomsPage',
		UserDefinedForm::class
	);

	public function Rooms(){
		return MeetingRoomPage::get()->filter(array('ParentID' => $this->ID));
	}

}
