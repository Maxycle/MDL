class PostsController < ApplicationController
	skip_before_action :authenticate_user!, only: [:index, :show]
	
	def index
		@posts = Post.with_attached_images.includes(:user).order(created_at: :desc)
		render json: @posts.map { |post|
			{
				id: post.id,
				title: post.title,
				content: post.content,
				content_html: post.content_html,
				created: post.created_at,
				author: {
					id: post.user.id,
					username: post.user.username,
					email: post.user.email,
					first_name: post.user.first_name,
					last_name: post.user.last_name
				},
				images: post.images.map { |img| rails_blob_url(img) }
			}
		}
	end

  def create
    # Ensure only admin users can create posts
    return render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user&.admin?

    @post = current_user.posts.build(post_params)

    if @post.save
      # Handle separately uploaded images
      if params[:images].present?
        params[:images].each do |image|
          @post.images.attach(image)
        end
      end

      # Optional: Handle TinyMCE image uploads within the content
      process_tiny_mce_images if @post.content.present?

      render json: {
        id: @post.id,
        title: @post.title,
        content: @post.content,
        content_html: @post.content_html,
				images: @post.images.map { |img| rails_blob_path(img, disposition: "inline", only_path: true) }
      }, status: :created
    else
      render json: @post.errors, status: :unprocessable_entity
    end
  end

	def upload_image
		return render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user&.admin?
		
		image = params[:image]
		blob = ActiveStorage::Blob.create_and_upload!(
			io: image.open,
			filename: image.original_filename,
			content_type: image.content_type
		)
	
		# Add content disposition inline and make URL public
		url = rails_blob_url(blob, disposition: "inline")
		
		# Set headers to allow image display
		response.headers['Access-Control-Allow-Origin'] = '*'
		
		render json: {
			location: url
		}
	end

	def destroy
		@post = Post.find(params[:id])
		if @post.destroy
			render json: { message: "Post successfully deleted" }, status: :ok
		else
			render json: { error: "Failed to delete post" }, status: :unprocessable_entity
		end
	end
	
  private

  def post_params
    params.require(:post).permit(:title, :content)
  end

  def process_tiny_mce_images
    # Extract images from TinyMCE content and attach them
    require 'nokogiri'
    doc = Nokogiri::HTML(@post.content)
    doc.css('img').each do |img|
      # Download and attach images from URLs
      begin
        uri = URI.parse(img['src'])
        if uri.scheme && ['http', 'https'].include?(uri.scheme)
          downloaded_image = URI.open(uri)
          @post.images.attach(
            io: downloaded_image, 
            filename: File.basename(uri.path)
          )
        end
      rescue => e
        Rails.logger.error "Failed to download image: #{e.message}"
      end
    end
  end
end