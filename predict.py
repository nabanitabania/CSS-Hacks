  
import sys
import torch
import torch.nn as nn
import numpy as np
from torchvision import models, transforms
from PIL import Image

items = ['cardboard', 'glass', 'metal', 'paper', 'plastic']
model = models.resnet18()

num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 5)

model.eval()
checkpoint = torch.load('G:\\hacks-css\\web\\checkpoint.pth.tar')
model.load_state_dict(checkpoint['state_dict'])

data_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

im = Image.open(sys.argv[1])
im = data_transforms(im)
img = np.asarray(im)
img = np.expand_dims(img,0)
img = torch.Tensor(list(img))

out = model(img)
_,index = torch.max(out, 1)



print(items[index])
