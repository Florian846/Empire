
import os
from PIL import Image

def create_blended_tiles(blend_map_path, texture1_path, texture2_path, texture1_name, texture2_name, output_dir):
    """
    Processes a blend map image to create new tiles by blending two textures.

    Args:
        blend_map_path (str): Path to the source image with the blend map tiles.
        texture1_path (str): Path to the texture for transparent pixels.
        texture2_path (str): Path to the texture for black pixels.
        texture1_name (str): Name of the first texture for the output filename.
        texture2_name (str): Name of the second texture for the output filename.
        output_dir (str): Directory to save the new tiles.
    """
    try:
        blend_map_img = Image.open(blend_map_path).convert("RGBA")
        texture1_img = Image.open(texture2_path).convert("RGBA")
        texture2_img = Image.open(texture1_path).convert("RGBA")
    except FileNotFoundError as e:
        print(f"Error: Could not open image file. {e}")
        return

    tile_size = 16
    map_width, map_height = blend_map_img.size
    
    if map_width % tile_size != 0 or map_height % tile_size != 0:
        print(f"Warning: Image dimensions ({map_width}x{map_height}) are not a multiple of tile size ({tile_size}).")

    tiles_x = map_width // tile_size
    tiles_y = map_height // tile_size
    
    print(f"Image size: {map_width}x{map_height}. Found {tiles_x}x{tiles_y} tiles.")

    tile_index = 0
    for ty in range(tiles_y):
        for tx in range(tiles_x):
            # Create a new blank 16x16 tile
            new_tile = Image.new("RGBA", (tile_size, tile_size))

            # Process each pixel in the tile
            for y in range(tile_size):
                for x in range(tile_size):
                    # Coordinates in the large blend map
                    map_x = tx * tile_size + x
                    map_y = ty * tile_size + y

                    # Get the pixel from the blend map
                    blend_pixel = blend_map_img.getpixel((map_x, map_y))
                    r, g, b, a = blend_pixel

                    # Decide which texture to use
                    if a == 0:
                        # Transparent: use texture 1
                        pixel_to_draw = texture1_img.getpixel((x, y))
                    elif r == 0 and g == 0 and b == 0:
                        # Black: use texture 2
                        pixel_to_draw = texture2_img.getpixel((x, y))
                    else:
                        # Otherwise: use the original blend map pixel
                        pixel_to_draw = blend_pixel
                    
                    new_tile.putpixel((x, y), pixel_to_draw)
            
            # Save the new tile
            output_filename = f"{texture2_name}{texture1_name}{tile_index}.png"
            output_path = os.path.join(output_dir, output_filename)
            new_tile.save(output_path)
            print(f"Saved {output_path}")
            tile_index += 1

if __name__ == "__main__":
    # Base path to your project textures
    base_dir = r"E:\Projekte\Empire\Empire\src\textures"

    # --- Configuration ---
    # The main blend map containing the tile patterns
    blend_map_file = os.path.join(base_dir, "blend", "TextureBlend.png")
    
    # The directory where the new tiles will be saved
    output_directory = os.path.join(base_dir, "blend")

    # Define the texture combinations you want to process
    # Each tuple contains: (texture1_path, texture2_path, texture1_name, texture2_name)
    combinations = [
        (os.path.join(base_dir, "dirt.png"), os.path.join(base_dir, "sand.png"), "Dirt", "Sand"),
        (os.path.join(base_dir, "dirt.png"), os.path.join(base_dir, "Stone.png"), "Dirt", "Stone"),
    ]

    # --- Execution ---
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
        print(f"Created output directory: {output_directory}")

    for t1_path, t2_path, t1_name, t2_name in combinations:
        print(f"--- Processing combination: {t1_name} & {t2_name} ---")
        create_blended_tiles(
            blend_map_path=blend_map_file,
            texture1_path=t1_path,
            texture2_path=t2_path,
            texture1_name=t2_name,
            texture2_name=t1_name,
            output_dir=output_directory
        )
    print("--- Script finished. ---")
