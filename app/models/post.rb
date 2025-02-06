class Post < ApplicationRecord
  belongs_to :user
  has_many_attached :images

  validates :title, presence: true
  validates :content, presence: true

	# Ensure only admin users can create posts
	validate :user_must_be_admin

  def content_html
    # Use a gem like RedCarpet for Markdown or Nokogiri for HTML sanitization
    require 'redcarpet'
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true, tables: true)
    markdown.render(content)
  end

  private

  def user_must_be_admin
    unless user&.admin?
      errors.add(:user, "must be an admin to create a post")
    end
  end

  # For JSON serialization
  def as_json(options = {})
    super(options.merge(
      methods: [:content_html],
      include: {
        images: {
          methods: [:url]
        }
      }
    ))
  end
end