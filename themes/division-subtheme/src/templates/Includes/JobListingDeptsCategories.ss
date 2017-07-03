<% if $Categories.exists || $Tags.exists %>
	<div class="blog-post-meta">
		<% if $Categories.exists %>
			<p class="tags">Category:
			<% loop $Categories %>
				<a href="$Link">$Title</a><% if not Last %><% else %><% end_if %>
			<% end_loop %>
			</p>
		<% end_if %>

		<% if $Departments.exists %>
			<p class="tags">Department:
			<% loop $Departments %>
				<a href="$Link">$Title</a><% if not Last %><% else %><% end_if %>
			<% end_loop %>
			</p>
		<% end_if %>
	</div>
<% end_if %>