const styles = ['Cubism', 'Expressionism', 'Surrealism', 'Abstract', 'Minimalism', 'Constructivism', 'Symbolism', 'Abstract', 'Suprematism', 'Bauhaus'];

async function ArtAPI(vert, style) {
    const styleToUse = style ? style : styles[Math.floor(Math.random() * styles.length)];

    const res = await fetch(`https://api.artic.edu/api/v1/artworks/search?q=landscape%20${styleToUse}%20painting&fields=id,title,image_id,thumbnail,dimensions&limit=100`);
    const data = await res.json();
    
    const paintings = data.data.filter(art => {
        const width = art.thumbnail?.width;
        const height = art.thumbnail?.height;
        if (vert) {
            return width && height && width > height;
        } else {
            return width && height && height > width;
        }
    });

    const random = paintings[Math.floor(Math.random() * paintings.length)]

    let artToSend;

    if (random) {
        artToSend ={
            title: random.title,
            imageUrl: `https://www.artic.edu/iiif/2/${random.image_id}/full/843,/0/default.jpg`
        }
    }

    return artToSend;
}

export default ArtAPI;