json.global_activities do
  json.more more
  json.activities activities do |activity|
    json.id activity.id
    json.message activity.message
    if activity.my_module
      json.project activity.my_module.experiment.project.name
      json.task activity.my_module.name
    end
    json.created_at activity.created_at
  end
end
