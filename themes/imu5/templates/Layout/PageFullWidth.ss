
<% if $BackgroundImage %>
	<div class="img-container" style="background-image: url($BackgroundImage.URL);">
		<div class="img-fifty-top"></div>
	</div>
<% end_if %>
	<div class="gradient">
		<div class="page-full-width">
			<div class="container clearfix">
				<div class="white-cover"></div>
				 <section class="main-content <% if $BackgroundImage %>margin-top<% end_if %>">
				 	$Breadcrumbs
					$Content
					$Form

				 </section>
			</div>
		</div>
	</div>
<% include TopicsAndNews %>

