<div class="gradient">
	<div class="container clearfix">
		<div class="white-cover"></div>
		<section class="main-content">
			$Form
			$Content
			<ul class="staff-list no-teams">
				<% loop Children %>
				<li>
					<% if $Photo %>
					<a href="$Link" class="staff-link">
					<img src="$Photo.CroppedImage(350,234).URL" alt="$FirstName $LastName" class="staff-img">
					</a>
					<% else %>
					<a href="$Link" class="staff-link">
					
					<img src="division-project/images/dosl.png" alt="$FirstName $LastName" class="staff-img">
					</a>
					<% end_if %>
					<p class="staff-name">
					<a href="$Link">$FirstName $LastName</a>
					<% if $Position %><small class="staff-position">$Position</small><% end_if %>
					</p>
				</li>
				<% end_loop %>
				<li class="filler"></li>
				<li class="filler"></li>
			</ul>
			
		</section>
		
		<section class="sec-content hide-print">
			
			<% include SideNav %>
		</section>
	</div>
</div>
<%-- <% include TopicsAndNews %> --%>