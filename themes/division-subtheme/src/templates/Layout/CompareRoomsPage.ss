$Header
<main class="main-content__container" id="main-content__container">

	<!-- Background Image Feature -->
	<% if $BackgroundImage %>
		<% include FeaturedImage %>
	<% end_if %>
	
	<% if not $BackgroundImage %>
		<div class="column row">
	        <div class="main-content__header">
	            $Breadcrumbs
				<h1>$Title</h1>
			</div>
		</div>
	<% end_if %>

	$BeforeContent

	<div class="row">

		<div class="main-content main-content--with-padding <% if $SiteConfig.ShowExitButton %>main-content--with-exit-button-padding<% end_if %> <% if $Children || $Menu(2) || $SidebarArea.Elements ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
			$BeforeContentConstrained
			<% if $MainImage %>
				<img class="main-content__main-img" src="$MainImage.ScaleMaxWidth(500).URL" alt="" role="presentation"/>
			<% end_if %>
			<div class="main-content__text">
				$Content
	            $AfterContentConstrained
	            $Form
				<% with $Page(meetings) %>

						<table class="responsive-table">
						<thead>
							<tr>
								<th scope="col">Room</th>
								<th scope="col">Capacity</th>
								<th scope="col">Computer</th>
								<th scope="col">Ethernet</th>
								<th scope="col">Projector</th>
								<th scope="col">DVD</th>
								<th scope="col">Speakers</th>
								<th scope="col">Markerboard</th>
								<th scope="col">Microphone</th>
								<th scope="col">WiFi</th>
							</tr>
						</thead>
						<tbody>
							<% loop $Children %>
								<tr>
									<th scope="row"><a href="$Link">$Title</a></th>
									<td data-title="Capacity">$DisplayCapacity</td>
									<td data-title="Computer"><% if HasComputer %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Ethernet"><% if HasEthernetConnection %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Projector"><% if HasProjectorScreen %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="DVD"><% if HasDVD %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Speakers"><% if HasSpeakers %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Markerboard"><% if HasMarkerboard %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="Microphone"><% if HasMicrophone %>&#10003;<% else %>&nbsp;<% end_if %></td>
									<td data-title="WiFi"><% if HasWifi %>&#10003;<% else %>&nbsp;<% end_if %></td>
								</tr>
							<% end_loop %>
						</tbody>
					</table>
					<% end_with %>
			</div>

			<% if $ShowChildPages %>
				<% include ChildPages %>
			<% end_if %>

		</div>
		<aside class="sidebar dp-sticky">
			<% include SideNav %>
			<% if $SideBarView %>
				$SideBarView
			<% end_if %>
			$SidebarArea
		</aside>
	</div>
$AfterContent


</main>