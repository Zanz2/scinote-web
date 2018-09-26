# frozen_string_literal: true

module Api
  module V1
    class ProjectCommentSerializer < ActiveModel::Serializer
      type :project_comments
      attributes :id, :message, :user_id, :type, :associated_id

      belongs_to :project, serializer: ProjectSerializer
    end
  end
end