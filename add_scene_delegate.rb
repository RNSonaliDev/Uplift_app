require 'xcodeproj'
project_path = 'ios/UpliftApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.first
group = project.main_group.find_subpath(File.join('UpliftApp'), true)
file_ref = group.new_file('SceneDelegate.swift')
target.source_build_phase.add_file_reference(file_ref)
project.save
