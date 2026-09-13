import os
import re

screens_dir = "/Users/sonalisolanki/Documents/LiveProject/Uplift_app/src/screens"

for root, _, files in os.walk(screens_dir):
    for filename in files:
        if filename.endswith(".tsx"):
            file_path = os.path.join(root, filename)
            with open(file_path, "r") as f:
                content = f.read()
            
            original_content = content
            
            # Replace <Text style={styles.headerTitle}>...</Text>
            content = re.sub(r'<Text\s+style=\{styles\.headerTitle\}>([\s\S]*?)<\/Text>', 
                             r'<AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: \'center\'}}>\1</AppText>', 
                             content)
                             
            # Replace <AppText ... style={styles.headerTitle}>...</AppText>
            content = re.sub(r'<AppText[^>]*style=\{styles\.headerTitle\}[^>]*>([\s\S]*?)<\/AppText>', 
                             r'<AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: \'center\'}}>\1</AppText>', 
                             content)
            
            if content != original_content:
                # Add imports if missing
                if "AppText" not in content:
                    # calculate relative path
                    rel = os.path.relpath("/Users/sonalisolanki/Documents/LiveProject/Uplift_app/src/components/AppText", root)
                    content = re.sub(r"(import .* from 'react-native';\n)", f"\\1import {{AppText}} from '{rel}';\n", content)
                if "Colors" not in content:
                    rel = os.path.relpath("/Users/sonalisolanki/Documents/LiveProject/Uplift_app/src/theme/colors", root)
                    content = re.sub(r"(import .* from 'react-native';\n)", f"\\1import {{Colors}} from '{rel}';\n", content)
                
                with open(file_path, "w") as f:
                    f.write(content)
                print(f"Updated: {file_path}")
