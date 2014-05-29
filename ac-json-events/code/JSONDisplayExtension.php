<?php
class JSONDisplayExtension extends DataExtension{

	private function parseEvent($rawEvent){

	 	$id = new Text('ID');
	 	$id = $rawEvent['id'];
	 	
	 	$name = new Text('name');
	 	$name->setValue($rawEvent['name']);

	 	$link = new Text('Link');
	 	$link->setValue($rawEvent['link']);
	 	
	 	$more_info_link = new Text('more_info_link');
	 	$more_info_link->setValue($rawEvent['more_info_link']);

	 	$facebook_event_link = new Text('facebook_event_link');
	 	$facebook_event_link->setValue($rawEvent['facebook_event_link']);

	 	$imageURL = new Text('ImageURL');
		$imageURL->setValue($rawEvent['image']);	

		$cancel_note = new Text('cancel_note');
		$cancel_note->setValue($rawEvent['cancel_note']);
	 	
		$nextDateTime = new SS_Datetime('NextDateTime');
		$nextDateTime->setValue(strtotime($rawEvent['dates'][0]['start_date'].' '.$rawEvent['dates'][0]['start_time']));
		
		$dateTimeCount = new Int('DateTimeCount');
		$dateTimeCount->setValue(count($rawEvent['dates']));

		$cost = new Text('Cost');
		$cost->setValue($rawEvent['price']);
			
		$location = new Text('Location');
		$location->setValue($rawEvent['location']);

		$venue = new Text('Venue');
		if($rawEvent['venues']) {
			$venue->setValue($rawEvent['venues'][0]['name']);
		}

		$sponsors = new Text('Sponsors');
		if($rawEvent['sponsors']) {
			$sponsors->setValue($rawEvent['sponsors'][0]['name']);
		}

		$eventTypes = new Text('Event Types');
		if($rawEvent['event_types']) {
			$eventTypeNames = array_map(function($item) { return $item['name']; }, $rawEvent['event_types']);
			//$eventTypeNames = array_column($rawEvent['event_types'], 'name');
			$eventTypes->setValue(implode(', ', $eventTypeNames));
		}

		$parsedEvent = new ArrayData(array(
			'ID'			=> $id,
		    'Title'         => $name,
		    'Link' => $link,
		    'FacebookEventLink' => $facebook_event_link,
		    'MoreInfoLink' => $more_info_link,
		    'ImageURL' => $imageURL,
		    'CancelNote' => $cancel_note,
		    'NextDateTime'		=> $nextDateTime,
		    'DateTimeCount' => $dateTimeCount,
		    'Cost'		=> $cost,
		    'Location'	=> $location,
		    'Venue' => $venue,
		    'Sponsors' => $sponsors,
		    'EventTypes' => $eventTypes
	    ));
		return $parsedEvent;
	}

	public function AfterClassEvent($id){

		$feedURL = 'http://afterclass.uiowa.edu/events/feed/';
		$feed = new ArrayList();
		$rawFeed = file_get_contents($feedURL);

		$eventsDecoded = json_decode($rawFeed, TRUE);
		
		if(isset($eventsDecoded['events'])){
			foreach($eventsDecoded['events'] as $event) {
				if($event['id'] == $id){
					return $this->parseEvent($event);
				}
			}
		}
		return false;
	}

	public function AfterClassEvents($category = 0) {
		
		$feedBase = "http://afterclass.uiowa.edu/events/";
		$eventsList = new ArrayList();

		$eventsPage = AfterClassEventsPage::get()->First();

		if($eventsPage){
			$feedURL = $feedBase."categories/".$eventsPage->DisplayCategory.'/feed/json';
		}else{
			$feedURL = $feedBase."feed/json";
		}

		$rawFeed = file_get_contents($feedURL);
		$eventsDecoded = json_decode($rawFeed, TRUE);

		if(isset($eventsDecoded['events'])){
			foreach($eventsDecoded['events'] as $event) {
				$eventsList->push($this->parseEvent($event));
			}		
			return $eventsList;   
		}
	}
}