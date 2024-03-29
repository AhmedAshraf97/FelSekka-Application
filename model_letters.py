# -*- coding: utf-8 -*-
"""
Created on Sat Jul 18 02:50:02 2020

@author: narim
"""

import os
from sklearn.model_selection import train_test_split
import numpy as np
import skimage.io as io
from skimage.color import rgb2gray
from commonfunctions import *
from skimage.filters import threshold_otsu,gaussian
import argparse
import cv2
from skimage.morphology import dilation,square,erosion,skeletonize, thin,binary_erosion, binary_dilation
from skimage import feature
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from PIL import Image
from skimage.measure import find_contours
from skimage.filters import median
from skimage.morphology import disk
from skimage.draw import rectangle
from skimage import data, filters
from skimage.filters import threshold_local
import math  
from skimage import util 
import tensorflow as tf
from tensorflow import keras
from keras.models import load_model
import h5py


def BinarizingImage(Image):
    Image[Image<127]=0
    Image[Image>=127]=1
    return Image
  
def featuresextraction(Image):
    featurevector=[]
    #resize   
    if( (Image.shape[0]<28) or (Image.shape[1]<28)) :
        resizedimg = cv2.resize(Image.astype(np.uint8), (28,28), interpolation = cv2.INTER_LINEAR)
    else:
        resizedimg = cv2.resize(Image.astype(np.uint8), (28,28), interpolation = cv2.INTER_AREA)
    resized=BinarizingImage(resizedimg)
    #Height/Width 
    vertical_img = np.sum(resized,axis=1)
    result1 = np.where(vertical_img >= 1)
    height=result1[0][-1]-result1[0][0]
    horizontal_img = np.sum(resized,axis=0)
    result2 = np.where(horizontal_img >= 1)  
    width=result2[0][-1]-result2[0][0]
    ratio=height/width
    featurevector.append(ratio)
    #NumberOfBlackPixels/NumberOfWhitePixels
    NumberOfWhitePixels = cv2.countNonZero(resized)
    NumberOfBlackPixels = 784 - NumberOfWhitePixels
    ratioB2W=NumberOfBlackPixels/NumberOfWhitePixels
    featurevector.append(ratioB2W)
    #NumberOfHorizontalTransitions
    for j in range(28):
        transitionsVertical=0
        flag=0
        i=0
        while(i<28):
            if(resized[j][i]==1 and flag==0): #white
                transitionsVertical+=1
                flag=1
            elif(resized[j][i]==0 and flag==1): #black
                transitionsVertical+=1
                flag=0
            i+=1
        featurevector.append(transitionsVertical)
    #NumberOfVerticalTransitions
    for j in range(28):
        transitionsVertical=0
        flag=0
        i=0
        while(i<28):
            if(resized[i][j]==1 and flag==0): #white
                transitionsVertical+=1
                flag=1
            elif(resized[i][j]==0 and flag==1): #black
                transitionsVertical+=1
                flag=0
            i+=1
        featurevector.append(transitionsVertical)
    #Baseline location vertical
    xline= thin(resized)
    horizontal_img = np.sum(xline,axis=1)
    blur=gaussian(horizontal_img)
    PeakValue= np.argmax(blur)
    featurevector.append(PeakValue+1)
    #Baseline location horizontal
    xline= thin(resized)
    horizontal_img = np.sum(xline,axis=0)
    blur=gaussian(horizontal_img)
    PeakValue= np.argmax(blur)
    featurevector.append(PeakValue+1)
    #detect holes

    transitionsVertical=0
    flag=0
    i=0
    while(i<28):
        if (resized[i,13]==1 and flag==0): #white
            transitionsVertical+=1
            flag=1
        elif(resized[i,13]==0 and flag==1): #black
            transitionsVertical+=1
            flag=0
        i+=1      
        if(transitionsVertical>= 3):
            featurevector.append(1)
            x=1
        else:
            featurevector.append(0)
            x=0
    #4 regions
    Region1= resized[0:13,0:13]
    Region2= resized[0:13,14:27]
    Region3= resized[14:27,0:13]
    Region4= resized[14:27,14:27]
    
    #Black Pixels in Region 1/ White Pixels in Region 1
    NumberOfWhitePixels = cv2.countNonZero(Region1)
    NumberOfBlackPixels = 196 - NumberOfWhitePixels
    ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
    featurevector.append(ratioB2W)
    #Black Pixels in Region 2/ White Pixels in Region 2
    NumberOfWhitePixels = cv2.countNonZero(Region2)
    NumberOfBlackPixels = 196 - NumberOfWhitePixels
    ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
    featurevector.append(ratioB2W)
    #Black Pixels in Region 3/ White Pixels in Region 3
    NumberOfWhitePixels = cv2.countNonZero(Region3)
    NumberOfBlackPixels = 196 - NumberOfWhitePixels
    ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
    featurevector.append(ratioB2W)
    #Black Pixels in Region 4/ White Pixels in Region 4
    NumberOfWhitePixels = cv2.countNonZero(Region4)
    NumberOfBlackPixels = 196 - NumberOfWhitePixels
    ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
    featurevector.append(ratioB2W)
    #Black Pixels in Region 1/ Black Pixels in Region 2
    NumberOfWhitePixels = cv2.countNonZero(Region1)
    NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
    NumberOfWhitePixels = cv2.countNonZero(Region2)
    NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
    ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
    featurevector.append(ratioB2B)
    #Black Pixels in Region 3/ Black Pixels in Region 4
    NumberOfWhitePixels = cv2.countNonZero(Region3)
    NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
    NumberOfWhitePixels = cv2.countNonZero(Region4)
    NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
    ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
    featurevector.append(ratioB2B)
    #Black Pixels in Region 1/ Black Pixels in Region 3
    NumberOfWhitePixels = cv2.countNonZero(Region1)
    NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
    NumberOfWhitePixels = cv2.countNonZero(Region3)
    NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
    ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
    featurevector.append(ratioB2B)
    #Black Pixels in Region 2/ Black Pixels in Region 4
    NumberOfWhitePixels = cv2.countNonZero(Region2)
    NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
    NumberOfWhitePixels = cv2.countNonZero(Region4)
    NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
    ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
    featurevector.append(ratioB2B)
    #Black Pixels in Region 1/ Black Pixels in Region 4
    NumberOfWhitePixels = cv2.countNonZero(Region1)
    NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
    NumberOfWhitePixels = cv2.countNonZero(Region4)
    NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
    ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
    featurevector.append(ratioB2B)
    #Black Pixels in Region 2/ Black Pixels in Region 3
    NumberOfWhitePixels = cv2.countNonZero(Region2)
    NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
    NumberOfWhitePixels = cv2.countNonZero(Region3)
    NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
    ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
    featurevector.append(ratioB2B)
 
    #HorizontalProjection
    horizontal_img = np.sum(resized,axis=1) #sum on x-axis (rows) 
    featurevector=np.concatenate((featurevector,horizontal_img))
    #VerticalProjection
    vertical_img = np.sum(resized,axis=0) #sum on x-axis (rows) 
    featurevector=np.concatenate((featurevector,vertical_img))
    #28 x 28
    A=np.array(resized).flatten()
    featurevector=np.concatenate((featurevector,A))
    return featurevector

def extractCharacters(image):
    image= ((rgb2gray(image))*255).astype(np.uint8)
    image = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1] 
    rows = image.shape[0]
    cols = image.shape[1]  
    image = median(image,disk(1))
    kernel1size = int(rows/20)
    kernel = np.ones((kernel1size,kernel1size),np.uint8)
    image=binary_erosion(image,kernel)
    copy = np.copy(image)
    kernel = np.ones((4,4),np.uint8)
    image=binary_dilation(image,kernel)
    contours = find_contours(image,0.8)
    boxes= []
    bounding_boxes = []
    for contour in contours:
        box = []
        r = image.shape[0]
        c = image.shape[1] 
        minX = (int(np.min(contour[:,1])))
        minY = (int(np.min(contour[:,0])))
        maxX = (int(np.max(contour[:,1])))
        maxY = (int(np.max(contour[:,0])))
        if(minY>r/4 and minY<r/2):
            minY = minY- (int(r/10))
        if(maxY<3*r/4 and maxY>r/2):
            maxY = maxY + (int(r/10))
        box.append(minX)
        box.append(maxX)
        box.append(minY)
        box.append(maxY)
        boxes.append(box)
    for box in boxes:      
        width = abs(box[1]-box[0])
        length = abs(box[3]-box[2])
        r = image.shape[0]
        c = image.shape[1] 
        if( width<int(4*c/5) ):
            if(length>int(r/3) and length<int(4*r/5)):
                bounding_boxes.append(box)
    kernel = np.ones((1,1),np.uint8)
    if(len(bounding_boxes)==1):
        finalcharacter = copy[(bounding_boxes[0][2]):(bounding_boxes[0][3] + 3) , (bounding_boxes[0][0]-3):(bounding_boxes[0][1]+3) ]
        finalcharacter = binary_erosion(finalcharacter,kernel)
        finalcharacter = median(finalcharacter,disk(1))
        # finalcharacter = binary_erosion(finalcharacter,kernel)
    elif(len(bounding_boxes)==2):
            area0 = (bounding_boxes[0][3] - bounding_boxes[0][2]) * (bounding_boxes[0][1] - bounding_boxes[0][0])
            area1 = (bounding_boxes[1][3] - bounding_boxes[1][2]) * (bounding_boxes[1][1] - bounding_boxes[1][0])
            if(area0>area1):
                finalcharacter = copy[(bounding_boxes[0][2]):(bounding_boxes[0][3] + 3) , (bounding_boxes[0][0]-3):(bounding_boxes[0][1]+3) ]
                finalcharacter = binary_erosion(finalcharacter,kernel)
                finalcharacter = median(finalcharacter,disk(1))
            #      finalcharacter = binary_erosion(finalcharacter,kernel)
            else:
                finalcharacter = copy[(bounding_boxes[1][2]):(bounding_boxes[1][3] + 3) , (bounding_boxes[1][0]-3):(bounding_boxes[1][1]+3) ]
                finalcharacter = binary_erosion(finalcharacter,kernel)
                finalcharacter = median(finalcharacter,disk(1))
            #       finalcharacter = binary_erosion(finalcharacter,kernel)
    else:
        finalcharacter = copy
        finalcharacter = binary_erosion(finalcharacter,kernel)
        finalcharacter = median(finalcharacter,disk(1))     
    return finalcharacter



def GetFeaturesLabels(Images_folder):
    Features_Vector = []
    Labels_Vector = []
    print("Started Chuncking!")
    #Letters     
    for image_path in os.listdir(Images_folder):
        input_path = os.path.join(Images_folder, image_path)
        if input_path.endswith('.png'):
            image = io.imread(input_path)
            if("label_28" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(16)
            elif("label_27" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(15) 
            elif("label_26" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(14)
                
            elif("label_25" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(13)
            elif("label_24" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(12)
            elif("label_23" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(11)
            elif("label_22" in image_path):
                continue
            elif("label_21" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(10) 
            elif("label_20" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(9)
            elif("label_19" in image_path):
                continue
            elif("label_18" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(8) 
            elif("label_17" in image_path):
                continue 
            elif("label_16" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(7)
            elif("label_15" in image_path):
                continue
            elif("label_14" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(6)
            elif("label_13" in image_path):
                continue
            elif("label_12" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(5)
            elif("label_11" in image_path):
                continue
            elif("label_10" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(4)
            elif("label_9" in image_path):
                continue
            elif("label_8" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(3)
            elif("label_7" in image_path):
                continue
            elif("label_6" in image_path):
                continue
            elif("label_5" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(2)
            elif("label_4" in image_path):
                continue
            elif("label_3" in image_path):
                continue
            elif("label_2" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(1)
            elif("label_1" in image_path):
                Features = featuresextraction(image)
                Features_Vector.append(Features)
                Labels_Vector.append(0)    
    Labels_Vector=np.asarray(Labels_Vector)
    Features_Vector=np.asarray(Features_Vector)
    return Features_Vector,Labels_Vector                

Images_folder = "C:\\NodejsProjects//letters"
Features_Vector,Labels_Vector=GetFeaturesLabels(Images_folder) 
FeaturesTrain,FeaturesTest,LabelsTrain,LabelsTest = train_test_split(Features_Vector,Labels_Vector,test_size = 0.2)
FTest,FValidate,LTest,LValidate= train_test_split(FeaturesTest,LabelsTest,test_size = 0.5,random_state=109)


model = keras.Sequential([
    #938
        keras.layers.InputLayer(input_shape = (938,)),
        keras.layers.Dense(600,activation= tf.nn.relu),
        keras.layers.Dense(300,activation= tf.nn.relu),
        keras.layers.Dense(17,activation= tf.nn.softmax)
        ])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])



model.fit(
  Features_Vector,
  Labels_Vector,
  epochs=10,
  batch_size=64,
  validation_data=(FValidate,LValidate)
)

model.evaluate(
  FTest,
  LTest
)

model.save('my_model_keras_letters.h5')
model.save_weights('my_model_weights_letters.h5')

