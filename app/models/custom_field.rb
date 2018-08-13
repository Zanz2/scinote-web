class CustomField < ApplicationRecord
  auto_strip_attributes :name, nullify: false
  validates :name,
            presence: true,
            length: { maximum: Constants::NAME_MAX_LENGTH },
            uniqueness: { scope: :team, case_sensitive: true },
            exclusion: { in: ['Assigned', 'Sample name', 'Sample type',
                              'Sample group', 'Added on', 'Added by'] }
  validates :user, :team, presence: true

  belongs_to :user, inverse_of: :custom_fields, optional: true
  belongs_to :team, inverse_of: :custom_fields, optional: true
  belongs_to :last_modified_by,
             foreign_key: 'last_modified_by_id',
             class_name: 'User',
             optional: true
end
